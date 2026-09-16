import { RADIUS } from '@/constants/themes'

export const getGroupedRadius = (isFirst, isLast) => ({
    borderTopLeftRadius: isFirst ? RADIUS.outer : 0,
    borderTopRightRadius: isFirst ? RADIUS.outer : 0,
    borderBottomLeftRadius: isLast ? RADIUS.outer : 0,
    borderBottomRightRadius: isLast ? RADIUS.outer : 0
})
