import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { Text } from '@expo/ui/jetpack-compose'

import { FONTS, FONT_SIZE } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

const TONES = {
    primary: '',
    secondary: TINT.label,
    tertiary: TINT.placeholder
}

export function DialogText({ children, tone = 'primary', bold = false, small = false }) {
    const { colors } = useTheme()

    const style = useMemo(() => ({
        fontFamily: bold ? FONTS.azeretMedium : FONTS.azeretLight,
        fontSize: small ? FONT_SIZE.sm : undefined
    }), [bold, small])

    return (
        <Text color={colors.onBackground + TONES[tone]} style={style}>
            {children}
        </Text>
    )
}
