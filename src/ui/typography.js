import { StyleSheet, Text } from 'react-native'

import { useHeadingFamily } from '@/ui/hooks/use-heading-family'
import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/ui/tokens/theme'

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
    const headingFontFamily = useHeadingFamily()
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
