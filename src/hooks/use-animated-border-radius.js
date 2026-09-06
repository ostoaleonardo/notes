import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

export function useAnimatedBorderRadius(active, { from, to }) {
    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => ({
        borderRadius: interpolate(progress.value, [0, 1], [from, to])
    }))
}
