import { SEGMENT_RADIUS } from '@/constants/components'
import { GROUP_AXES, GROUP_POSITIONS } from '@/constants/group-position'
import { RADIUS } from '@/constants/theme'

export const getGroupPosition = (index, total) => {
    if (total <= 1) return GROUP_POSITIONS.ONLY
    if (index === 0) return GROUP_POSITIONS.FIRST

    return index === total - 1 ? GROUP_POSITIONS.LAST : GROUP_POSITIONS.MIDDLE
}

export const getSegmentCorners = (position, outer, inner) => ({
    left: position === GROUP_POSITIONS.FIRST || position === GROUP_POSITIONS.ONLY ? outer : inner,
    right: position === GROUP_POSITIONS.LAST || position === GROUP_POSITIONS.ONLY ? outer : inner
})

export const getStackedCorners = (position, inner = 0) => ({
    top: position === GROUP_POSITIONS.FIRST || position === GROUP_POSITIONS.ONLY ? RADIUS.lg : inner,
    bottom: position === GROUP_POSITIONS.LAST || position === GROUP_POSITIONS.ONLY ? RADIUS.lg : inner
})

export const getStackedRadiusStyle = (position, inner) => {
    const { top, bottom } = getStackedCorners(position, inner)

    return {
        borderTopLeftRadius: top,
        borderTopRightRadius: top,
        borderBottomLeftRadius: bottom,
        borderBottomRightRadius: bottom
    }
}

export const getCornerRadii = (position, axis) => {
    if (axis === GROUP_AXES.SEGMENTED) {
        const { left, right } = getSegmentCorners(position, SEGMENT_RADIUS.outer, SEGMENT_RADIUS.inner)

        return { topLeft: left, bottomLeft: left, topRight: right, bottomRight: right }
    }

    const { top, bottom } = getStackedCorners(position, RADIUS.md)

    return { topLeft: top, topRight: top, bottomLeft: bottom, bottomRight: bottom }
}
