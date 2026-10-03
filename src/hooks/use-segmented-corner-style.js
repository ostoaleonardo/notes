import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { GROUP_CORNERS, RADIUS } from '@/constants/radius'

export function useSegmentedCornerStyle(position, active) {
    const { left, right } = GROUP_CORNERS[position]

    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, [0, 1], [left, RADIUS.pill]),
        borderBottomLeftRadius: interpolate(progress.value, [0, 1], [left, RADIUS.pill]),
        borderTopRightRadius: interpolate(progress.value, [0, 1], [right, RADIUS.pill]),
        borderBottomRightRadius: interpolate(progress.value, [0, 1], [right, RADIUS.pill])
    }))
}
