import { StateField } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { Decoration, EditorView } from '@codemirror/view'
import { CODE_RANGE_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { mediaMapFacet } from './media-map'
import { inlineMarkNodeNames, decorateInlineMark, inlineMarksTheme } from './inline-marks'
import { headingNodeNames, decorateHeading, headingsTheme } from './headings'
import { linkNodeNames, decorateLink, linksTheme } from './links'
import { imageNodeNames, decorateImage, imagesTheme } from './images'
import { listNodeNames, decorateList, listsTheme } from './lists'
import { blockquoteNodeNames, decorateBlockquote, blockquoteTheme } from './blockquote'
import { codeBlockNodeNames, decorateCodeBlock, codeBlocksTheme } from './code-blocks'
import { horizontalRuleNodeNames, decorateHorizontalRule, horizontalRuleTheme } from './horizontal-rule'
import { htmlNodeNames, decorateHtml, htmlTheme } from './html'
import { decorateMath, mathTheme } from './math'
import { decorateFootnotes, footnotesTheme } from './footnotes'

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
    ...htmlNodeNames.map((name) => [name, decorateHtml])
])

const buildDecorations = (state) => {
    const ranges = []
    const selection = state.selection.main
    const doc = state.doc
    const mediaMap = state.facet(mediaMapFacet)
    const codeRanges = []

    syntaxTree(state).iterate({
        enter: (node) => {
            if (codeRangeNodeNames.has(node.name)) codeRanges.push({ from: node.from, to: node.to })

            const handler = NODE_HANDLERS.get(node.name)
            if (!handler) return

            if (handler(node, { doc, selection, ranges, mediaMap })) return false
        }
    })

    const text = doc.toString()
    decorateMath({ text, selection, ranges, codeRanges })
    decorateFootnotes({ text, ranges, codeRanges })

    return Decoration.set(ranges, true)
}

export { mediaMapFacet }

export const liveFormatting = StateField.define({
    create: (state) => buildDecorations(state),
    update: (decorations, tr) => (
        tr.docChanged || tr.selection || tr.reconfigured ? buildDecorations(tr.state) : decorations.map(tr.changes)
    ),
    provide: (field) => EditorView.decorations.from(field)
})

export const buildLiveFormattingTheme = ({ linkColor, codeBackgroundColor, thematicBreakColor }) => ({
    ...inlineMarksTheme({ codeBackgroundColor }),
    ...headingsTheme(),
    ...linksTheme({ linkColor }),
    ...imagesTheme(),
    ...listsTheme({ linkColor }),
    ...blockquoteTheme({ linkColor }),
    ...codeBlocksTheme({ codeBackgroundColor }),
    ...horizontalRuleTheme({ thematicBreakColor }),
    ...htmlTheme({ linkColor, codeBackgroundColor }),
    ...mathTheme(),
    ...footnotesTheme({ linkColor })
})
