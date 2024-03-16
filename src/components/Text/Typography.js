import { StyleSheet, Text } from 'react-native'
import { colors, fonts } from '@/constants'

export function Typography({ children, variant = 'paragraph', bold, uppercase, color, opacity }) {
    const variantStyles = styles[variant]

    return (
        <Text style={[
            variantStyles,
            bold && styles.bold,
            uppercase && styles.uppercase,
            color && { color },
            opacity && { opacity },
        ]}>
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    paragraph: {
        fontSize: 14,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    caption: {
        fontSize: 12,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    uppercase: {
        textTransform: 'uppercase',
    },
    bold: {
        fontWeight: 'bold',
    },
})
