import { Decoration } from '@codemirror/view'
import { LINK_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { collectMarks, isRangeSelected } from './utils'

export const linkNodeNames = LINK_NODE_NAMES

export const decorateLink = (node, { selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    if (node.name === 'Autolink') {
        ranges.push(Decoration.mark({ class: 'cm-live-link' }).range(node.from, node.to))
        return true
    }

    const marks = collectMarks(node.node)
    if (marks.length < 2) return true

    ranges.push(Decoration.replace({}).range(marks[0].from, marks[0].to))
    if (marks[0].to < marks[1].from) {
        ranges.push(Decoration.mark({ class: 'cm-live-link' }).range(marks[0].to, marks[1].from))
    }

    if (marks.length >= 4) {
        ranges.push(Decoration.replace({}).range(marks[1].from, node.to))
    } else {
        const label = node.node.getChild('LinkLabel')
        ranges.push(Decoration.replace({}).range(marks[1].from, label ? label.to : marks[1].to))
    }

    return true
}

export const linksTheme = ({ linkColor }) => ({
    '.cm-live-link': { color: linkColor, textDecoration: 'underline' }
})
