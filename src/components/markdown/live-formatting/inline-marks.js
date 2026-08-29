import { Decoration } from '@codemirror/view'
import { INLINE_MARK_NODE_TYPES } from '@/constants/markdown-live-formatting'
import { collectMarks, isRangeSelected } from './utils'

export const inlineMarkNodeNames = Object.keys(INLINE_MARK_NODE_TYPES)

export const decorateInlineMark = (node, { selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    const className = INLINE_MARK_NODE_TYPES[node.name]
    const marks = collectMarks(node.node)
    if (marks.length < 2) return true

    const innerFrom = marks[0].to
    const innerTo = marks[marks.length - 1].from

    ranges.push(Decoration.replace({}).range(marks[0].from, marks[0].to))
    if (innerFrom < innerTo) ranges.push(Decoration.mark({ class: className }).range(innerFrom, innerTo))
    ranges.push(Decoration.replace({}).range(marks[marks.length - 1].from, marks[marks.length - 1].to))

    return false
}

export const inlineMarksTheme = ({ codeBackgroundColor }) => ({
    '.cm-live-strong': { fontWeight: 'bold' },
    '.cm-live-em': { fontStyle: 'italic' },
    '.cm-live-strike': { textDecoration: 'line-through' },
    '.cm-live-code': {
        fontFamily: 'ui-monospace, monospace',
        backgroundColor: codeBackgroundColor,
        borderRadius: '4px',
        padding: '0.1em 0.3em'
    }
})
