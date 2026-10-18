import { ICON_TOGGLE } from '@/constants/components'

export const getPosition = (index, total) => {
    if (total === 1) return 'only'
    if (index === 0) return 'first'

    return index === total - 1 ? 'last' : 'middle'
}

export const expandSelected = (buttons) => buttons.map((button) => ({
    ...button,
    expandable: true,
    showLabel: Boolean(button.selected),
    iconSize: ICON_TOGGLE.iconSize
}))

export const getMinWidth = (buttons, widths) => Math.max(
    0,
    ...buttons
        .filter((button) => button.showLabel)
        .map((button) => widths[button.label] ?? 0)
)
