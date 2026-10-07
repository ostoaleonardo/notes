import { memo } from 'react'
import Animated from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'

import { Typography } from '@/components/typography'

import { useAnimatedBorderRadius } from '@/hooks/use-animated-border-radius'

import { RADIUS, SPACING, OPACITY } from '@/constants/theme'
import { COLOR_OPTION } from '@/constants/components'

export const ColorOption = memo(function ColorOption({ name, active, onPress, children, options }) {
    const colors = options[name]

    const animatedStyle = useAnimatedBorderRadius(
        active, { from: COLOR_OPTION.radius, to: RADIUS.lg }
    )

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            style={{
                width: COLOR_OPTION.width,
                alignItems: 'center',
                gap: SPACING.xxs
            }}
        >
            <Animated.View
                style={[
                    styles.color,
                    animatedStyle, {
                        borderColor: colors.borderColor,
                        backgroundColor: colors.background
                    }
                ]}
            />
            <Typography
                bold={active}
                opacity={active ? 1 : OPACITY.disabled}
            >
                {children}
            </Typography>
        </Pressable>
    )
})

const styles = StyleSheet.create({
    color: {
        width: COLOR_OPTION.size,
        height: COLOR_OPTION.size,
        borderWidth: COLOR_OPTION.borderWidth
    }
})
