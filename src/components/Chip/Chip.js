import { Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import Animated, { FadeInLeft, FadeOutLeft, LinearTransition } from 'react-native-reanimated'
import { Typography } from '../Text'

export function Chip({ label, onPress, variant = 'primary', endContent }) {
    const { colors } = useTheme()

    const VARIANTS = {
        primary: {
            color: colors.background,
            backgroundColor: colors.onBackground,
            borderColor: colors.onBackground
        },
        bordered: {
            color: colors.onBackground,
            backgroundColor: colors.transparent,
            borderColor: colors.outline
        }
    }

    const { color, backgroundColor, borderColor } = VARIANTS[variant]

    return (
        <Animated.View
            entering={FadeInLeft}
            exiting={FadeOutLeft}
            layout={LinearTransition}
        >
            <Pressable
                onPress={onPress}
                style={{
                    borderWidth: 1,
                    borderRadius: 32,
                    paddingVertical: 8,
                    borderColor,
                    backgroundColor,
                    paddingLeft: endContent ? 16 : 24,
                    paddingRight: endContent ? 8 : 24
                }}
            >
                <View style={styles.content}>
                    <Typography
                        bold
                        uppercase
                        color={color}
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

const styles = StyleSheet.create({
    content: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
