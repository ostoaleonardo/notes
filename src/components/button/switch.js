import { Pressable, StyleSheet } from 'react-native'
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated'
import { useTheme } from 'react-native-paper'

import { useAnimatedProgress } from '@/hooks/use-animated-progress'

import { SWITCH } from '@/constants/components'
import { OPACITY, PROGRESS_RANGE } from '@/constants/theme'

const OFF_INSET = (SWITCH.track.height - SWITCH.thumb.off) / 2
const ON_INSET = (SWITCH.track.height - SWITCH.thumb.on) / 2

export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }) {
    const { colors } = useTheme()
    const progress = useAnimatedProgress(value)

    const trackStyle = useAnimatedStyle(() => ({
        borderColor: colors.outline,
        backgroundColor: interpolateColor(progress.value, PROGRESS_RANGE, [colors.surfaceVariant, colors.tertiary]),
        borderWidth: interpolate(progress.value, PROGRESS_RANGE, [SWITCH.track.borderWidth, 0])
    }))

    const thumbStyle = useAnimatedStyle(() => {
        const size = interpolate(progress.value, PROGRESS_RANGE, [SWITCH.thumb.off, SWITCH.thumb.on])

        return {
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: interpolate(progress.value, PROGRESS_RANGE, [
                OFF_INSET - SWITCH.track.borderWidth,
                SWITCH.track.width - SWITCH.thumb.on - ON_INSET
            ]),
            backgroundColor: interpolateColor(progress.value, PROGRESS_RANGE, [colors.onSurfaceVariant, colors.surface])
        }
    })

    return (
        <Pressable
            disabled={disabled}
            onPress={() => onValueChange(!value)}
            accessibilityRole='switch'
            accessibilityState={{ checked: value, disabled }}
            accessibilityLabel={accessibilityLabel}
            hitSlop={SWITCH.hitSlop}
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
        width: SWITCH.track.width,
        height: SWITCH.track.height,
        borderRadius: SWITCH.track.height / 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    disabled: {
        opacity: OPACITY.disabled
    }
})
