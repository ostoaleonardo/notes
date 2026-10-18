import { useEffect } from 'react'
import { useSharedValue, withTiming } from 'react-native-reanimated'

import { ANIMATION_DURATION } from '@/constants/theme'

export function useAnimatedProgress(
    active,
    duration = ANIMATION_DURATION,
    releaseDuration = duration
) {
    const progress = useSharedValue(active ? 1 : 0)

    useEffect(() => {
        progress.value = withTiming(active ? 1 : 0, {
            duration: active ? duration : releaseDuration
        })
    }, [active, duration, releaseDuration, progress])

    return progress
}
