import { Pressable, StyleSheet } from 'react-native'
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useTheme } from 'react-native-paper'

import { useAnimatedProgress } from '@/hooks/use-animated-progress'

import { SWITCH_TRACK, SWITCH_THUMB } from '@/constants/themes'

const OFF_INSET = (SWITCH_TRACK.height - SWITCH_THUMB.off) / 2
const ON_INSET = (SWITCH_TRACK.height - SWITCH_THUMB.on) / 2

export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }) {
    const { colors } = useTheme()
    const progress = useAnimatedProgress(value)

    const trackStyle = useAnimatedStyle(() => ({
        borderColor: colors.outline,
        backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surfaceVariant, colors.tertiary]),
        borderWidth: interpolate(progress.value, [0, 1], [SWITCH_TRACK.borderWidth, 0])
    }))

    const thumbStyle = useAnimatedStyle(() => {
        const size = interpolate(progress.value, [0, 1], [SWITCH_THUMB.off, SWITCH_THUMB.on])

        return {
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: interpolate(progress.value, [0, 1], [
                OFF_INSET - SWITCH_TRACK.borderWidth,
                SWITCH_TRACK.width - SWITCH_THUMB.on - ON_INSET
            ]),
            backgroundColor: interpolateColor(progress.value, [0, 1], [colors.onSurfaceVariant, colors.surface])
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
        width: SWITCH_TRACK.width,
        height: SWITCH_TRACK.height,
        borderRadius: SWITCH_TRACK.height / 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    disabled: {
        opacity: 0.4
    }
})
