import { Decoration } from '@codemirror/view'

import { isRangeSelected } from './utils'
import { CheckboxWidget } from './widgets'

import { LIST_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { CHECKED_TASK_PATTERN } from '@/constants/markdown-patterns'
import { LEZER_NODES } from '@/constants/lezer-nodes'

export const listNodeNames = LIST_NODE_NAMES

export const decorateList = (node, { doc, selection, ranges }) => {
    if (node.name === LEZER_NODES.TASK_MARKER) {
        if (isRangeSelected(selection, node.from, node.to)) return true

        const checked = CHECKED_TASK_PATTERN.test(doc.sliceString(node.from, node.to))
        const widget = new CheckboxWidget(checked, node.from, node.to)
        ranges.push(Decoration.replace({ widget }).range(node.from, node.to))
        return true
    }

    ranges.push(Decoration.mark({ class: 'cm-live-accent-mark' }).range(node.from, node.to))
    return true
}

export const listsTheme = ({ colors }) => ({
    '.cm-live-checkbox': { verticalAlign: 'middle', marginRight: '0.3em', accentColor: colors.tertiary }
})
