import { Decoration } from '@codemirror/view'

import { isRangeSelected } from './utils'

import { HORIZONTAL_RULE_NODE_NAMES } from '@/features/editor/dom/constants/markdown-live-formatting'
import { buildBorder } from '@/shared/utils/css-values'

export const horizontalRuleNodeNames = HORIZONTAL_RULE_NODE_NAMES

export const decorateHorizontalRule = (node, { selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    ranges.push(Decoration.mark({ class: 'cm-live-hr' }).range(node.from, node.to))
    return true
}

export const horizontalRuleTheme = ({ colors }) => ({
    '.cm-live-hr': {
        display: 'inline-block',
        width: '100%',
        color: 'transparent',
        lineHeight: 0,
        borderTop: buildBorder(colors.thematicBreak)
    }
})
