import { StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '@/constants'

const SIZE_VARIANTS = {
    title: 24,
    subtitle: 16,
    paragraph: 14,
    caption: 12
}

export function Typography({ children, bold, uppercase, color, opacity, textAlign, fontSize, fontFamily, variant = 'paragraph', ...props }) {
    const fontVariant = fontSize || SIZE_VARIANTS[variant]

    return (
        <Text
            style={[
                styles.base,
                color && { color },
                opacity && { opacity },
                { fontSize: fontVariant },
                textAlign && { textAlign },
                uppercase && styles.uppercase,
                bold ? styles.bold : styles.regular,
                fontFamily && { fontFamily },
            ]}
            {...props}
        >
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
    base: {
        color: COLORS.white
    },
    uppercase: {
        textTransform: 'uppercase'
    },
    regular: {
        fontFamily: FONTS.azeretLight
    },
    bold: {
        fontFamily: FONTS.azeretMedium
    }
})
