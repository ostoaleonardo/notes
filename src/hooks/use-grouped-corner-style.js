import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'
import { useGroupPosition } from './use-group-position'

import { getStackedCorners } from '@/utils/group-position'

import { RADIUS, PROGRESS_RANGE } from '@/constants/theme'

export function useGroupedCornerStyle(active) {
    const position = useGroupPosition()
    const { top, bottom } = getStackedCorners(position, RADIUS.md)

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
