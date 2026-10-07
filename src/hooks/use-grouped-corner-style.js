import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { RADIUS, PROGRESS_RANGE } from '@/constants/theme'

export function useGroupedCornerStyle(first, last, active) {
    const top = first ? RADIUS.lg : RADIUS.md
    const bottom = last ? RADIUS.lg : RADIUS.md

    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => {
        const topRadius = interpolate(progress.value, PROGRESS_RANGE, [top, RADIUS.xl])
        const bottomRadius = interpolate(progress.value, PROGRESS_RANGE, [bottom, RADIUS.xl])

        return {
            borderTopLeftRadius: topRadius,
            borderTopRightRadius: topRadius,
            borderBottomLeftRadius: bottomRadius,
            borderBottomRightRadius: bottomRadius
        }
    })
}
