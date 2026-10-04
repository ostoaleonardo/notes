import { memo } from 'react'
import Animated from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'

import { Typography } from '@/components/typography'

import { useAnimatedBorderRadius } from '@/hooks/use-animated-border-radius'

import { RADIUS } from '@/constants/radius'
import { SPACING } from '@/constants/spacing'

export const ColorOption = memo(function ColorOption({ name, active, onPress, children, options }) {
    const colors = options[name]

    const animatedStyle = useAnimatedBorderRadius(
        active, { from: 32, to: RADIUS.outer }
    )

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            style={{
                width: 100 / 3 + '%',
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
                opacity={active ? 1 : 0.3}
            >
                {children}
            </Typography>
        </Pressable>
    )
})

const styles = StyleSheet.create({
    color: {
        width: 64,
        height: 64,
        borderWidth: 2
    }
})
