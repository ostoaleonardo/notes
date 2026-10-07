import { RADIUS } from '@/constants/theme'

export const getGroupedRadius = (isFirst, isLast) => ({
    borderTopLeftRadius: isFirst ? RADIUS.lg : 0,
    borderTopRightRadius: isFirst ? RADIUS.lg : 0,
    borderBottomLeftRadius: isLast ? RADIUS.lg : 0,
    borderBottomRightRadius: isLast ? RADIUS.lg : 0
})
