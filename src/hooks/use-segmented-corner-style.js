import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { GROUP_CORNERS, GROUP_PILL_RADIUS } from '@/constants/themes'

export function useSegmentedCornerStyle(position, active) {
    const { left, right } = GROUP_CORNERS[position]

    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, [0, 1], [left, GROUP_PILL_RADIUS]),
        borderBottomLeftRadius: interpolate(progress.value, [0, 1], [left, GROUP_PILL_RADIUS]),
        borderTopRightRadius: interpolate(progress.value, [0, 1], [right, GROUP_PILL_RADIUS]),
        borderBottomRightRadius: interpolate(progress.value, [0, 1], [right, GROUP_PILL_RADIUS])
    }))
}
