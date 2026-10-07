import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { PROGRESS_RANGE } from '@/constants/theme'

export function useAnimatedBorderRadius(active, { from, to }) {
    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => ({
        borderRadius: interpolate(progress.value, PROGRESS_RANGE, [from, to])
    }))
}
