import { StyleSheet, Text } from 'react-native'
import { useTheme } from 'react-native-paper'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/fonts'

export function Typography({
    children,
    bold,
    uppercase,
    color,
    opacity,
    textAlign,
    fontSize,
    variant = 'paragraph',
    styleProps,
    ...props
}) {
    const { colors } = useTheme()
    const fontVariant = fontSize || TYPOGRAPHY_SIZE_VARIANTS[variant]

    return (
        <Text
            style={[
                { fontSize: fontVariant },
                { color: colors.onBackground },
                color && { color },
                opacity && { opacity },
                textAlign && { textAlign },
                uppercase && styles.uppercase,
                bold ? styles.bold : styles.regular,
                styleProps
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
