import { BUTTON, ICON_TOGGLE } from '@/constants/components'

export const getTargetWidth = (expanded, contentWidth) => {
    if (!expanded) return BUTTON.size

    return contentWidth === null ? null : contentWidth + ICON_TOGGLE.labelPaddingTotal
}
