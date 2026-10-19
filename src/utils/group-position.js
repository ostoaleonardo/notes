import { RADIUS } from '@/constants/theme'

export const GROUP_POSITIONS = {
    ONLY: 'only',
    FIRST: 'first',
    MIDDLE: 'middle',
    LAST: 'last'
}

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
