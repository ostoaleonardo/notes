import { Pressable, StyleSheet } from 'react-native'
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useTheme } from 'react-native-paper'

import { useAnimatedProgress } from '@/hooks/use-animated-progress'

const TRACK_WIDTH = 52
const TRACK_HEIGHT = 32
const TRACK_BORDER_WIDTH = 2
const THUMB_OFF_SIZE = 16
const THUMB_ON_SIZE = 24

const OFF_INSET = (TRACK_HEIGHT - THUMB_OFF_SIZE) / 2
const ON_INSET = (TRACK_HEIGHT - THUMB_ON_SIZE) / 2

export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }) {
    const { colors } = useTheme()
    const progress = useAnimatedProgress(value)

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surfaceVariant, colors.tertiary]),
        borderColor: colors.outline,
        borderWidth: interpolate(progress.value, [0, 1], [TRACK_BORDER_WIDTH, 0])
    }))

    const thumbStyle = useAnimatedStyle(() => {
        const size = interpolate(progress.value, [0, 1], [THUMB_OFF_SIZE, THUMB_ON_SIZE])

        return {
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: interpolate(progress.value, [0, 1], [
                OFF_INSET - TRACK_BORDER_WIDTH,
                TRACK_WIDTH - THUMB_ON_SIZE - ON_INSET
            ]),
            backgroundColor: interpolateColor(progress.value, [0, 1], [colors.onSurfaceVariant, colors.onTertiary])
        }
    })

    return (
        <Pressable
            disabled={disabled}
            onPress={() => onValueChange(!value)}
            accessibilityRole='switch'
            accessibilityState={{ checked: value, disabled }}
            accessibilityLabel={accessibilityLabel}
            hitSlop={8}
            style={disabled && styles.disabled}
        >
            <Animated.View style={[styles.track, trackStyle]}>
                <Animated.View style={thumbStyle} />
            </Animated.View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    track: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    disabled: {
        opacity: 0.4
    }
})
