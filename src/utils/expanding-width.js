import { CONTROL_SIZE, ICON_TOGGLE } from '@/constants/components'

export const getTargetWidth = (expanded, contentWidth) => {
    if (!expanded) return CONTROL_SIZE.small

    return contentWidth === null ? null : contentWidth + ICON_TOGGLE.labelPaddingTotal
}
