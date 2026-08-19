import { COMMONS } from '@/constants'

export const getGroupedRadius = (isFirst, isLast) => ({
    borderTopLeftRadius: isFirst ? COMMONS.radius : 0,
    borderTopRightRadius: isFirst ? COMMONS.radius : 0,
    borderBottomLeftRadius: isLast ? COMMONS.radius : 0,
    borderBottomRightRadius: isLast ? COMMONS.radius : 0
})
