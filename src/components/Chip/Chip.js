import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeInLeft, FadeOutLeft, LinearTransition } from 'react-native-reanimated'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

const COLOR_VARIANTS = {
    primary: COLORS.text,
    bordered: COLORS.text,
    flat: COLORS.primary
}

export function Chip({ label, onPress, variant, endContent }) {
    const styles = getChipStyles(variant, endContent ? true : false)
    const colorVariant = COLOR_VARIANTS[variant]

    return (
        <Animated.View
            entering={FadeInLeft}
            exiting={FadeOutLeft}
            layout={LinearTransition}
        >
            <Pressable
                onPress={onPress}
                style={styles.container}
            >
                <View style={styles.content}>
                    <Typography
                        bold
                        uppercase
                        variant='caption'
                        color={colorVariant}
                    >
                        {label}
                    </Typography>
                    {endContent}
                </View>
            </Pressable>
        </Animated.View>
    )
}

const getChipStyles = (variant, hasEndContent) => {
    let backgroundColor, borderColor
    const paddingLeft = hasEndContent ? 16 : 24
    const paddingRight = hasEndContent ? 8 : 24

    switch (variant) {
        case 'solid':
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            break
        case 'flat':
            backgroundColor = COLORS.primary15
            borderColor = COLORS.transparent
            break
        case 'bordered':
            backgroundColor = COLORS.transparent
            borderColor = COLORS.text10
            break
        default:
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            break
    }

    return StyleSheet.create({
        container: {
            borderWidth: 1,
            borderRadius: 32,
            paddingVertical: 8,
            paddingLeft,
            paddingRight,
            borderColor,
            backgroundColor,
        },
        content: {
            gap: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
    })
}
