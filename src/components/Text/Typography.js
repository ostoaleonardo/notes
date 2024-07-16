import { StyleSheet, Text } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

const SIZE_VARIANTS = {
    title: 24,
    subtitle: 16,
    paragraph: 14,
    caption: 12
}

export function Typography({ children, bold, uppercase, color, opacity, textAlign, fontSize, variant = 'paragraph', ...props }) {
    const { colors } = useTheme()
    const fontVariant = fontSize || SIZE_VARIANTS[variant]

    return (
        <Text
            style={[
                { fontSize: fontVariant },
                { color: colors.onBackground },
                color && { color },
                opacity && { opacity },
                textAlign && { textAlign },
                uppercase && styles.uppercase,
                bold ? styles.bold : styles.regular
            ]}
            {...props}
        >
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
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
