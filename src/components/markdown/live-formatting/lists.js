import { Decoration } from '@codemirror/view'
import { LIST_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { isRangeSelected } from './utils'
import { CheckboxWidget } from './widgets'

export const listNodeNames = LIST_NODE_NAMES

export const decorateList = (node, { doc, selection, ranges }) => {
    if (node.name === 'TaskMarker') {
        if (isRangeSelected(selection, node.from, node.to)) return true

        const checked = /\[[xX]\]/.test(doc.sliceString(node.from, node.to))
        ranges.push(Decoration.replace({ widget: new CheckboxWidget(checked, node.from, node.to) }).range(node.from, node.to))
        return true
    }

    ranges.push(Decoration.mark({ class: 'cm-live-accent-mark' }).range(node.from, node.to))
    return true
}

export const listsTheme = ({ linkColor }) => ({
    '.cm-live-checkbox': { verticalAlign: 'middle', marginRight: '0.3em', accentColor: linkColor }
})
