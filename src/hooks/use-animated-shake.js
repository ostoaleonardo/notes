import { useCallback } from 'react'
import { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'

export const useAnimatedShake = () => {
    const shakeTranslateX = useSharedValue(0)

    const shake = useCallback(() => {
        const amount = 10
        const config = {
            easing: Easing.bezier(0.35, 0.7, 0.5, 0.7),
            duration: 80
        }

        shakeTranslateX.value = withSequence(
            withTiming(amount, config),
            withRepeat(withTiming(-amount, config), 3, true),
            withSpring(0, { mass: 0.5 })
        )
    }, [])

    const style = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeTranslateX.value }]
        }
    }, [])

    const isShaking = useDerivedValue(() => {
        return shakeTranslateX.value !== 0
    }, [])

    return { shake, style, isShaking }
}
