import { useEffect } from 'react'
import { useSharedValue, withTiming } from 'react-native-reanimated'

import { ANIMATION_DURATION } from '@/constants/animation'

export function useAnimatedProgress(active, duration = ANIMATION_DURATION) {
    const progress = useSharedValue(active ? 1 : 0)

    useEffect(() => {
        progress.value = withTiming(active ? 1 : 0, { duration })
    }, [active])

    return progress
}
