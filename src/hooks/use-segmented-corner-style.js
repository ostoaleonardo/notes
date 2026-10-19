import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'

import { useGroupPosition } from './use-group-position'

import { getSegmentCorners } from '@/utils/group-position'

import { SEGMENT_RADIUS } from '@/constants/components'
import { ANIMATION_DURATION, RADIUS, PROGRESS_RANGE } from '@/constants/theme'

export function useSegmentedCornerStyle(active, releaseDuration = ANIMATION_DURATION) {
    const position = useGroupPosition()
    const { left, right } = getSegmentCorners(position, SEGMENT_RADIUS.outer, SEGMENT_RADIUS.inner)

    const progress = useAnimatedProgress(active, ANIMATION_DURATION, releaseDuration)

    return useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(progress.value, PROGRESS_RANGE, [left, RADIUS.xl]),
        borderBottomLeftRadius: interpolate(progress.value, PROGRESS_RANGE, [left, RADIUS.xl]),
        borderTopRightRadius: interpolate(progress.value, PROGRESS_RANGE, [right, RADIUS.xl]),
        borderBottomRightRadius: interpolate(progress.value, PROGRESS_RANGE, [right, RADIUS.xl])
    }))
}
