import { useEffect } from 'react'
import { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export function useAnimatedBorderRadius(active, { from, to }) {
    const progress = useSharedValue(active ? 1 : 0)

    useEffect(() => {
        progress.value = withTiming(active ? 1 : 0)
    }, [active])

    return useAnimatedStyle(() => ({
        borderRadius: interpolate(progress.value, [0, 1], [from, to])
    }))
}
