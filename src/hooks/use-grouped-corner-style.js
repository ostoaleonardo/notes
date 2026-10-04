import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { RADIUS } from '@/constants/radius'

export function useGroupedCornerStyle(first, last, active) {
    const top = first ? RADIUS.outer : RADIUS.inner
    const bottom = last ? RADIUS.outer : RADIUS.inner

    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => {
        const topRadius = interpolate(progress.value, [0, 1], [top, RADIUS.pill])
        const bottomRadius = interpolate(progress.value, [0, 1], [bottom, RADIUS.pill])

        return {
            borderTopLeftRadius: topRadius,
            borderTopRightRadius: topRadius,
            borderBottomLeftRadius: bottomRadius,
            borderBottomRightRadius: bottomRadius
        }
    })
}
