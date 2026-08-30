import { Decoration } from '@codemirror/view'
import { CODE_BLOCK_NODE_NAMES } from '@/constants/markdown-live-formatting'

export const codeBlockNodeNames = CODE_BLOCK_NODE_NAMES

export const decorateCodeBlock = (node, { doc, ranges }) => {
    const startLine = doc.lineAt(node.from).number
    const endLine = doc.lineAt(node.to).number

    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        ranges.push(Decoration.line({ class: 'cm-live-codeblock-line' }).range(doc.line(lineNumber).from))
    }

    for (const mark of node.node.getChildren('CodeMark')) {
        ranges.push(Decoration.mark({ class: 'cm-live-codeblock-fence' }).range(mark.from, mark.to))
    }

    const info = node.node.getChild('CodeInfo')
    if (info) ranges.push(Decoration.mark({ class: 'cm-live-codeblock-fence' }).range(info.from, info.to))

    return true
}

export const codeBlocksTheme = ({ codeBackgroundColor }) => ({
    '.cm-live-codeblock-line': {
        backgroundColor: codeBackgroundColor,
        fontFamily: 'ui-monospace, monospace',
        paddingLeft: '0.4em',
        paddingRight: '0.4em'
    },
    '.cm-live-codeblock-fence': { opacity: 0.5 }
})
