import { Decoration } from '@codemirror/view'
import { BLOCKQUOTE_NODE_NAMES } from '@/constants/markdown-live-formatting'

export const blockquoteNodeNames = BLOCKQUOTE_NODE_NAMES

export const decorateBlockquote = (node, { ranges }) => {
    if (node.name === 'QuoteMark') {
        ranges.push(Decoration.mark({ class: 'cm-live-accent-mark' }).range(node.from, node.to))
        return true
    }

    ranges.push(Decoration.mark({ class: 'cm-live-quote' }).range(node.from, node.to))
    return false
}

export const blockquoteTheme = ({ linkColor }) => ({
    '.cm-live-quote': { fontStyle: 'italic', opacity: 0.85 },
    '.cm-live-accent-mark': { color: linkColor, fontWeight: 'bold' }
})
