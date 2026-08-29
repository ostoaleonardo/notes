import { Decoration } from '@codemirror/view'
import { HORIZONTAL_RULE_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { isRangeSelected } from './utils'

export const horizontalRuleNodeNames = HORIZONTAL_RULE_NODE_NAMES

export const decorateHorizontalRule = (node, { selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    ranges.push(Decoration.mark({ class: 'cm-live-hr' }).range(node.from, node.to))
    return true
}

export const horizontalRuleTheme = ({ thematicBreakColor }) => ({
    '.cm-live-hr': {
        display: 'inline-block',
        width: '100%',
        color: 'transparent',
        lineHeight: 0,
        borderTop: `1px solid ${thematicBreakColor}`
    }
})
