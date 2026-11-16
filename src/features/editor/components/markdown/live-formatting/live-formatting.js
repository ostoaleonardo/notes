import { EditorSelection, EditorState, StateField } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { Decoration, EditorView } from '@codemirror/view'

import { mediaMapFacet } from './media-map'
import { applyZones, changedZones, selectionZones } from './decoration-zones'
import { overlapsAny } from './utils'
import { inlineMarkNodeNames, decorateInlineMark, inlineMarksTheme } from './inline-marks'
import { headingNodeNames, decorateHeading, headingsTheme } from './headings'
import { linkNodeNames, decorateLink, linksTheme } from './links'
import { imageNodeNames, decorateImage, imagesTheme } from './images'
import { listNodeNames, decorateList, listsTheme } from './lists'
import { blockquoteNodeNames, decorateBlockquote, blockquoteTheme } from './blockquote'
import { codeBlockNodeNames, decorateCodeBlock, codeBlocksTheme } from './code-blocks'
import {
    horizontalRuleNodeNames,
    decorateHorizontalRule,
    horizontalRuleTheme
} from './horizontal-rule'
import { htmlNodeNames, decorateHtml, htmlTheme } from './html'
import { decorateTable, tableTheme } from './table'
import { tableLabelsFacet } from './table-labels'
import { TableWidget } from './table-widget'
import { mathTheme } from './math'
import { liveMath } from './math-field'
import { decorateFootnotes, footnotesTheme } from './footnotes'
import { decorateBlockIds, blockIdsTheme } from './block-ids'
import { decorateExtraMarks, extraMarksTheme } from './extra-marks'
import { decorateCustomTasks, findCustomTaskRanges, customTasksTheme } from './custom-tasks'
import { findWikiLinkRanges, decorateWikiLinks, wikiLinksTheme } from './wiki-links'
import { linksReset, linksResolved, resolvedLinksField } from '@/features/editor/components/markdown/link-resolution'

import { getBoundaryEdit } from '@/features/editor/utils/table-boundary'

import { CODE_RANGE_NODE_NAMES } from '@/features/editor/constants/markdown-live-formatting'
import { TABLE_BOUNDARY_INPUT_EVENTS, TABLE_END_LINE } from '@/features/editor/constants/table'
import { LEZER_NODES } from '@/features/editor/constants/lezer-nodes'

const codeRangeNodeNames = new Set(CODE_RANGE_NODE_NAMES)
const NO_RESOLVED_LINKS = new Map()

const isLinkResolutionChange = (tr) => (
    tr.effects.some((effect) => effect.is(linksResolved) || effect.is(linksReset))
)

const NODE_HANDLERS = new Map([
    ...inlineMarkNodeNames.map((name) => [name, decorateInlineMark]),
    ...headingNodeNames.map((name) => [name, decorateHeading]),
    ...linkNodeNames.map((name) => [name, decorateLink]),
    ...imageNodeNames.map((name) => [name, decorateImage]),
    ...listNodeNames.map((name) => [name, decorateList]),
    ...blockquoteNodeNames.map((name) => [name, decorateBlockquote]),
    ...codeBlockNodeNames.map((name) => [name, decorateCodeBlock]),
    ...horizontalRuleNodeNames.map((name) => [name, decorateHorizontalRule]),
    ...htmlNodeNames.map((name) => [name, decorateHtml]),
    [LEZER_NODES.TABLE, decorateTable]
])

const shiftRange = (range, offset) => range.value.range(range.from + offset, range.to + offset)

const collectDecorationRanges = (state, from, to) => {
    const ranges = []
    const doc = state.doc
    const offset = -from
    const selection = state.selection.main
    const localSelection = { from: selection.from + offset, to: selection.to + offset }
    const mediaMap = state.facet(mediaMapFacet)
    const resolvedLinks = state.field(resolvedLinksField, false) ?? NO_RESOLVED_LINKS
    const tableLabels = state.facet(tableLabelsFacet)
    const codeRanges = []
    const text = doc.sliceString(from, to)
    const tree = syntaxTree(state)
    const wikiLinkRanges = findWikiLinkRanges(tree, text, from, to)
    const customTaskRanges = findCustomTaskRanges(tree, text, from, to)
    const textRanges = from === 0 ? ranges : []

    syntaxTree(state).iterate({
        from,
        to,
        enter: (node) => {
            if (codeRangeNodeNames.has(node.name)) {
                codeRanges.push({ from: node.from + offset, to: node.to + offset })
            }

            const isLink = linkNodeNames.includes(node.name)
            if (isLink && overlapsAny(node.from + offset, node.to + offset, wikiLinkRanges)) return
            if (isLink && overlapsAny(node.from + offset, node.to + offset, customTaskRanges)) return

            const handler = NODE_HANDLERS.get(node.name)
            if (!handler) return

            if (handler(node, { doc, selection, ranges, mediaMap, tableLabels })) return false
        }
    })

    const localSource = { text, selection: localSelection, ranges: textRanges, codeRanges }

    decorateFootnotes(localSource)
    decorateBlockIds(localSource)
    decorateCustomTasks({ ...localSource, customTaskRanges })
    decorateExtraMarks(localSource)
    decorateWikiLinks({ ...localSource, wikiLinkRanges, resolvedLinks, mediaMap })

    return from === 0 ? ranges : ranges.concat(textRanges.map((range) => shiftRange(range, from)))
}

const buildLiveFormattingDecorations = (state) => (
    Decoration.set(collectDecorationRanges(state, 0, state.doc.length), true)
)

const guardTableBoundary = (field) => EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged || !TABLE_BOUNDARY_INPUT_EVENTS.some((event) => tr.isUserEvent(event))) return tr

    const edits = []
    tr.changes.iterChanges((from, to, fromB, toB, inserted) => {
        edits.push({ from, to, insert: inserted.toString() })
    })

    if (edits.length !== 1) return tr

    const tables = []
    tr.startState.field(field).between(edits[0].from, edits[0].to, (from, to, value) => {
        if (value.spec.widget instanceof TableWidget) tables.push({ from, to })
    })

    const edit = getBoundaryEdit(edits[0], tables)
    if (!edit) return tr

    return {
        changes: edit.changes,
        selection: EditorSelection.cursor(edit.cursor),
        userEvent: 'input',
        scrollIntoView: true
    }
})

const ensureLineAfterTable = (field) => EditorState.transactionFilter.of((tr) => {
    if (tr.docChanged || !tr.isUserEvent('select')) return tr

    const end = tr.startState.doc.length
    if (tr.newSelection.main.head !== end) return tr

    let endsWithTable = false
    tr.startState.field(field).between(end, end, (from, to, value) => {
        if (value.spec.widget instanceof TableWidget) endsWithTable = true
    })

    if (!endsWithTable) return tr

    return [tr, {
        changes: { from: end, insert: TABLE_END_LINE },
        selection: EditorSelection.cursor(end + TABLE_END_LINE.length),
        sequential: true
    }]
})

export { mediaMapFacet, tableLabelsFacet }

export const liveFormatting = StateField.define({
    create: (state) => buildLiveFormattingDecorations(state),
    update: (decorations, tr) => {
        if (tr.reconfigured || isLinkResolutionChange(tr)) {
            return buildLiveFormattingDecorations(tr.state)
        }

        if (tr.docChanged) {
            const zones = changedZones(tr)
            if (!zones) return buildLiveFormattingDecorations(tr.state)

            return applyZones(
                decorations.map(tr.changes),
                tr.state,
                zones,
                collectDecorationRanges,
                buildLiveFormattingDecorations
            )
        }

        if (!tr.selection) return decorations
        if (syntaxTree(tr.startState) !== syntaxTree(tr.state)) return buildLiveFormattingDecorations(tr.state)

        return applyZones(
            decorations,
            tr.state,
            selectionZones(tr),
            collectDecorationRanges,
            buildLiveFormattingDecorations
        )
    },
    provide: (field) => [
        liveMath,
        EditorView.decorations.from(field),
        guardTableBoundary(field),
        ensureLineAfterTable(field),
        EditorView.atomicRanges.of((view) => view.state.field(field).update({
            filter: (_from, _to, value) => value.spec.widget instanceof TableWidget
        }))
    ]
})

export const buildLiveFormattingTheme = (theme) => ({
    ...inlineMarksTheme(theme),
    ...headingsTheme(theme),
    ...linksTheme(theme),
    ...imagesTheme(),
    ...listsTheme(theme),
    ...blockquoteTheme(theme),
    ...codeBlocksTheme(theme),
    ...horizontalRuleTheme(theme),
    ...htmlTheme(theme),
    ...tableTheme(theme),
    ...mathTheme(),
    ...footnotesTheme(theme),
    ...extraMarksTheme(theme),
    ...customTasksTheme(theme),
    ...blockIdsTheme(theme),
    ...wikiLinksTheme(theme)
})
