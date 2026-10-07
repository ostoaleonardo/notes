import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { GROUP_CORNERS } from '@/constants/components'
import { RADIUS, PROGRESS_RANGE } from '@/constants/theme'

export function useSegmentedCornerStyle(position, active) {
    const { left, right } = GROUP_CORNERS[position]

    const progress = useAnimatedProgress(active)

    return useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, PROGRESS_RANGE, [left, RADIUS.xl]),
        borderBottomLeftRadius: interpolate(progress.value, PROGRESS_RANGE, [left, RADIUS.xl]),
        borderTopRightRadius: interpolate(progress.value, PROGRESS_RANGE, [right, RADIUS.xl]),
        borderBottomRightRadius: interpolate(progress.value, PROGRESS_RANGE, [right, RADIUS.xl])
    }))
}
