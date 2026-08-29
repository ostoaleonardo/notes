import { Decoration } from '@codemirror/view'
import { CODE_BLOCK_NODE_NAMES } from '@/constants/markdown-live-formatting'

export const codeBlockNodeNames = CODE_BLOCK_NODE_NAMES

export const decorateCodeBlock = (node, { ranges }) => {
    ranges.push(Decoration.mark({ class: 'cm-live-codeblock' }).range(node.from, node.to))
    return true
}

export const codeBlocksTheme = ({ codeBackgroundColor }) => ({
    '.cm-live-codeblock': { fontFamily: 'ui-monospace, monospace', backgroundColor: codeBackgroundColor }
})
