import { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { useAnimatedProgress } from './use-animated-progress'
import { useGroupPosition } from './use-group-position'

import { getCornerRadii } from '@/utils/group-position'

import { ANIMATION_DURATION, RADIUS, PROGRESS_RANGE } from '@/constants/theme'

export function useGroupCornerStyle(axis, active, releaseDuration = ANIMATION_DURATION) {
    const position = useGroupPosition()
    const radii = getCornerRadii(position, axis)

    const progress = useAnimatedProgress(active, ANIMATION_DURATION, releaseDuration)

    return useAnimatedStyle(() => {
        const open = (closed) => interpolate(progress.value, PROGRESS_RANGE, [closed, RADIUS.xl])

        return {
            borderTopLeftRadius: open(radii.topLeft),
            borderTopRightRadius: open(radii.topRight),
            borderBottomLeftRadius: open(radii.bottomLeft),
            borderBottomRightRadius: open(radii.bottomRight)
        }
    })
}
