import { StyleSheet, Text } from 'react-native'
import { useTheme } from 'react-native-paper'

import { useHeadingFont } from '@/hooks/use-heading-font'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

export function Typography({
    children,
    bold,
    heading,
    uppercase,
    color,
    opacity,
    textAlign,
    fontSize,
    variant = 'bodyMedium',
    styleProps,
    ...props
}) {
    const { colors } = useTheme()
    const { fontFamily: headingFontFamily } = useHeadingFont()
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
                heading && { fontFamily: headingFontFamily },
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
