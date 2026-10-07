import { Decoration } from '@codemirror/view'

import { CODE_BLOCK_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { OPACITY, MONOSPACE_FONT_FAMILY } from '@/constants/theme'
import { LEZER_NODES } from '@/constants/lezer-nodes'

export const codeBlockNodeNames = CODE_BLOCK_NODE_NAMES

export const decorateCodeBlock = (node, { doc, ranges }) => {
    const startLine = doc.lineAt(node.from).number
    const endLine = doc.lineAt(node.to).number

    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        ranges.push(Decoration.line({ class: 'cm-live-codeblock-line' }).range(doc.line(lineNumber).from))
    }

    for (const mark of node.node.getChildren(LEZER_NODES.CODE_MARK)) {
        ranges.push(Decoration.mark({ class: 'cm-live-codeblock-fence' }).range(mark.from, mark.to))
    }

    const info = node.node.getChild(LEZER_NODES.CODE_INFO)
    if (info) ranges.push(Decoration.mark({ class: 'cm-live-codeblock-fence' }).range(info.from, info.to))

    return true
}

export const codeBlocksTheme = ({ colors }) => ({
    '.cm-live-codeblock-line': {
        backgroundColor: colors.codeBackground,
        fontFamily: MONOSPACE_FONT_FAMILY,
        paddingLeft: '0.4em',
        paddingRight: '0.4em'
    },
    '.cm-live-codeblock-fence': { opacity: OPACITY.muted }
})
