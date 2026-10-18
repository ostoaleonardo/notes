import { memo } from 'react'
import Animated from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'

import { useAnimatedBorderRadius } from '@/hooks/use-animated-border-radius'

import { COLOR_OPTION } from '@/constants/components'
import { OPACITY, RADIUS, SPACING, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export const FontOption = memo(function FontOption({
    fontFamily,
    preview,
    active,
    onPress,
    children
}) {
    const { colors } = useTheme()

    const animatedStyle = useAnimatedBorderRadius(
        active, { from: COLOR_OPTION.radius, to: RADIUS.lg }
    )

    return (
        <Pressable
            accessibilityRole='button'
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.preview,
                    animatedStyle,
                    { backgroundColor: active ? colors.tertiary : colors.surfaceVariant }
                ]}
            >
                <Typography
                    fontSize={TYPOGRAPHY_SIZE_VARIANTS.headlineSmall}
                    color={active ? colors.onTertiary : colors.onBackground}
                    styleProps={{ fontFamily }}
                >
                    {preview}
                </Typography>
            </Animated.View>
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
    container: {
        width: COLOR_OPTION.width,
        alignItems: 'center',
        gap: SPACING.xxs
    },
    preview: {
        width: COLOR_OPTION.size,
        height: COLOR_OPTION.size,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
