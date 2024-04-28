import { StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '@/constants'

const SIZE_VARIANTS = {
    title: 18,
    subtitle: 16,
    paragraph: 14,
    caption: 12
}

export function Typography({ children, variant = 'paragraph', bold, uppercase, color, opacity, textAlign }) {
    const fontSize = SIZE_VARIANTS[variant]

    return (
        <Text style={[
            styles.base,
            { fontSize },
            color && { color },
            opacity && { opacity },
            textAlign && { textAlign },
            uppercase && styles.uppercase,
            bold ? styles.bold : styles.regular
        ]}>
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
    base: {
        color: COLORS.text,
    },
    uppercase: {
        textTransform: 'uppercase',
    },
    regular: {
        fontFamily: FONTS.mono,
    },
    bold: {
        fontFamily: FONTS.monoBold,
    },
})
