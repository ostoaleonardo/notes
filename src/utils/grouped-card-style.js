import { getStackedCorners } from './group-position'

export const getGroupedRadius = (position, inner) => {
    const { top, bottom } = getStackedCorners(position, inner)

    return {
        borderTopLeftRadius: top,
        borderTopRightRadius: top,
        borderBottomLeftRadius: bottom,
        borderBottomRightRadius: bottom
    }
}
