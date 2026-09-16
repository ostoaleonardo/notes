import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { GROUP_CORNERS } from '@/constants/themes'

export function useSegmentedCornerStyle(position, active) {
    const { left, right } = GROUP_CORNERS[position]
    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, [0, 1], [left, 24]),
        borderBottomLeftRadius: interpolate(progress.value, [0, 1], [left, 24]),
        borderTopRightRadius: interpolate(progress.value, [0, 1], [right, 24]),
        borderBottomRightRadius: interpolate(progress.value, [0, 1], [right, 24])
    }))
}
