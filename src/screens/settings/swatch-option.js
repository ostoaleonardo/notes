import Animated from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'

import { Typography } from '@/ui/typography'

import { useAnimatedBorderRadius } from '@/hooks/use-animated-border-radius'

import { COLOR_OPTION } from '@/constants/components'
import { OPACITY, RADIUS, SPACING } from '@/constants/theme'

export const SwatchOption = ({
    active,
    onPress,
    swatch,
    swatchStyle,
    testID,
    children
}) => {
    const animatedStyle = useAnimatedBorderRadius(
        active, { from: COLOR_OPTION.radius, to: RADIUS.lg }
    )

    return (
        <Pressable
            onPress={onPress}
            testID={testID}
            accessibilityRole='button'
            accessibilityState={{ selected: !!active }}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.swatch,
                    animatedStyle,
                    swatchStyle
                ]}
            >
                {swatch}
            </Animated.View>
            <Typography
                bold={active}
                opacity={active ? 1 : OPACITY.disabled}
            >
                {children}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: COLOR_OPTION.width,
        alignItems: 'center',
        gap: SPACING.xxs
    },
    swatch: {
        width: COLOR_OPTION.size,
        height: COLOR_OPTION.size,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
