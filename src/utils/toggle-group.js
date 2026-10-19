import { ICON_TOGGLE } from '@/constants/components'

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
