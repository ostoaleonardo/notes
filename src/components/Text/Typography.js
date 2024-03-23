import { StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function Typography({ children, variant = 'paragraph', bold, uppercase, color, opacity, textAlign }) {
    const variantStyles = styles[variant]

    return (
        <Text style={[
            variantStyles,
            bold && styles.bold,
            uppercase && styles.uppercase,
            color && { color },
            opacity && { opacity },
            textAlign && { textAlign },
        ]}>
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        color: COLORS.text,
        fontFamily: FONTS.mono,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text,
        fontFamily: FONTS.mono,
    },
    paragraph: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily: FONTS.mono,
    },
    caption: {
        fontSize: 12,
        color: COLORS.text,
        fontFamily: FONTS.mono,
    },
    uppercase: {
        textTransform: 'uppercase',
    },
    bold: {
        fontWeight: 'bold',
    },
})
