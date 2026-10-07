import { StyleSheet, View } from 'react-native'

import { Typography } from '@/components/typography'

import { FONTS, SPACING, OPACITY, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function MessageScreen({ title, message, color, style, children }) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.text}>
                <Typography
                    fontSize={TYPOGRAPHY_SIZE_VARIANTS.display}
                    color={color}
                    textAlign='center'
                    styleProps={{ fontFamily: FONTS.nType82Headline }}
                >
                    {title}
                </Typography>
                <Typography
                    color={color}
                    opacity={OPACITY.secondary}
                    textAlign='center'
                >
                    {message}
                </Typography>
            </View>

            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: SPACING.xxxl,
        padding: SPACING.xxl,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        gap: SPACING.lg
    }
})
