import { useMemo } from 'react'
import { Box, LoadingIndicator, Text } from '@expo/ui/jetpack-compose'
import { size } from '@expo/ui/jetpack-compose/modifiers'

import { FONTS, FONT_SIZE, ICON_SIZE } from '@/ui/tokens/theme'
import { TRANSPARENT } from '@/ui/tokens/transparent'
import { useTheme } from '@/ui/hooks/use-theme'

export const ButtonContent = ({ children, loading }) => {
    const { colors } = useTheme()

    const textStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight,
        fontSize: FONT_SIZE.sm
    }), [])

    const spinnerModifiers = useMemo(() => [size(ICON_SIZE.md, ICON_SIZE.md)], [])

    return (
        <Box contentAlignment='center'>
            <Text
                color={loading ? TRANSPARENT.color : undefined}
                style={textStyle}
            >
                {String(children).toLocaleUpperCase()}
            </Text>
            {loading && (
                <LoadingIndicator
                    color={colors.onBackground}
                    modifiers={spinnerModifiers}
                />
            )}
        </Box>
    )
}
