import { StyleSheet, View } from 'react-native'

import { Typography } from '@/components/typography'

import { SPACING, OPACITY, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function MessageScreen({ title, message, color, style, children }) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.text}>
                <Typography
                    heading
                    fontSize={TYPOGRAPHY_SIZE_VARIANTS.headlineLarge}
                    color={color}
                    textAlign='center'
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
