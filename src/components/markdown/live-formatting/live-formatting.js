import { EditorSelection, EditorState, StateField } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { Decoration, EditorView } from '@codemirror/view'

import { mediaMapFacet } from './media-map'
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
import { decorateMath, mathTheme } from './math'
import { decorateFootnotes, footnotesTheme } from './footnotes'
import { decorateBlockIds, blockIdsTheme } from './block-ids'
import { decorateExtraMarks, extraMarksTheme } from './extra-marks'
import { decorateCustomTasks, customTasksTheme } from './custom-tasks'
import { findWikiLinkRanges, decorateWikiLinks, wikiLinksTheme } from './wiki-links'
import { noteEntriesFacet } from '../wiki-link-completion'

import { findCustomTaskRanges } from '@/utils/tasks'
import { getBoundaryEdit } from '@/utils/table-boundary'

import { CODE_RANGE_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { TABLE_BOUNDARY_INPUT_EVENTS, TABLE_END_LINE } from '@/constants/table'

const codeRangeNodeNames = new Set(CODE_RANGE_NODE_NAMES)

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
    ['Table', decorateTable]
])

const buildDecorations = (state) => {
    const ranges = []
    const selection = state.selection.main
    const doc = state.doc
    const mediaMap = state.facet(mediaMapFacet)
    const noteEntries = state.facet(noteEntriesFacet)
    const tableLabels = state.facet(tableLabelsFacet)
    const codeRanges = []
    const text = doc.toString()
    const wikiLinkRanges = findWikiLinkRanges(text)
    const customTaskRanges = findCustomTaskRanges(text)

    syntaxTree(state).iterate({
        enter: (node) => {
            if (codeRangeNodeNames.has(node.name)) codeRanges.push({ from: node.from, to: node.to })

            const isLink = linkNodeNames.includes(node.name)
            if (isLink && overlapsAny(node.from, node.to, wikiLinkRanges)) return
            if (isLink && overlapsAny(node.from, node.to, customTaskRanges)) return

            const handler = NODE_HANDLERS.get(node.name)
            if (!handler) return

            if (handler(node, { doc, selection, ranges, mediaMap, tableLabels })) return false
        }
    })

    decorateMath({ text, selection, ranges, codeRanges })
    decorateFootnotes({ text, ranges, codeRanges })
    decorateBlockIds({ text, ranges })
    decorateCustomTasks({ customTaskRanges, selection, ranges, codeRanges })
    decorateExtraMarks({ text, selection, ranges, codeRanges })
    decorateWikiLinks({ ranges, codeRanges, wikiLinkRanges, noteEntries, selection, mediaMap })

    return Decoration.set(ranges, true)
}

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
    create: (state) => buildDecorations(state),
    update: (decorations, tr) => (
        tr.docChanged || tr.selection || tr.reconfigured ? buildDecorations(tr.state) : decorations.map(tr.changes)
    ),
    provide: (field) => [
        EditorView.decorations.from(field),
        guardTableBoundary(field),
        ensureLineAfterTable(field),
        EditorView.atomicRanges.of((view) => view.state.field(field).update({
            filter: (from, to, value) => value.spec.widget instanceof TableWidget
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
