import { useEffect } from 'react'
import { useSharedValue, withTiming } from 'react-native-reanimated'

export function useAnimatedProgress(active, duration = 200) {
    const progress = useSharedValue(active ? 1 : 0)

    useEffect(() => {
        progress.value = withTiming(active ? 1 : 0, { duration })
    }, [active])

    return progress
}
