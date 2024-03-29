import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeInLeft, FadeOutLeft, LinearTransition } from 'react-native-reanimated'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function Chip({ label, onPress, variant, endContent }) {
    const styles = getChipStyles(variant, endContent !== undefined ? true : false)

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
        case 'bordered':
            backgroundColor = COLORS.transparent
            borderColor = COLORS.text15
            break
        default:
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            break
    }

    return StyleSheet.create({
        container: {
            borderWidth: 2,
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
