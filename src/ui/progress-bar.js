import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated'

import { useTheme } from '@/ui/hooks/use-theme'

import { PROGRESS_BAR } from '@/ui/tokens/components'
import { RADIUS, SPACING } from '@/ui/tokens/theme'

const SEGMENT = PROGRESS_BAR.indeterminateWidth

export const ProgressBar = ({
    progress = 0,
    indeterminate = false
}) => {
    const { colors } = useTheme()
    const offset = useSharedValue(0)

    useEffect(() => {
        if (!indeterminate) return undefined

        offset.value = 0
        offset.value = withRepeat(
            withTiming(1, {
                duration: PROGRESS_BAR.indeterminateDuration,
                easing: Easing.inOut(Easing.ease)
            }),
            -1
        )

        return () => cancelAnimation(offset)
    }, [indeterminate, offset])

    const sliding = useAnimatedStyle(() => ({
        left: `${(offset.value * (1 + SEGMENT) - SEGMENT) * 100}%`
    }))

    return (
        <View
            style={[
                styles.track,
                { backgroundColor: colors.outline }
            ]}
        >
            {indeterminate ? (
                <Animated.View
                    style={[
                        styles.bar,
                        sliding,
                        {
                            width: `${SEGMENT * 100}%`,
                            backgroundColor: colors.onBackground
                        }
                    ]}
                />
            ) : (
                <View
                    style={[
                        styles.bar,
                        {
                            width: `${progress * 100}%`,
                            backgroundColor: colors.onBackground
                        }
                    ]}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        height: SPACING.xxs,
        marginTop: SPACING.xxs,
        borderRadius: RADIUS.full,
        overflow: 'hidden'
    },
    bar: {
        height: '100%',
        borderRadius: RADIUS.full
    }
})
