import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { Badge as ComposeBadge, Text } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'

import { FONTS, FONT_SIZE } from '@/ui/tokens/theme'

export function Badge({ children, style }) {
    const { colors } = useTheme()
    const textStyle = useMemo(() => ({
        fontFamily: FONTS.azeretMedium,
        fontSize: FONT_SIZE.xs
    }), [])

    return (
        <ComposeHost style={style}>
            <ComposeBadge containerColor={colors.tertiary} contentColor={colors.onTertiary}>
                <Text style={textStyle}>{String(children)}</Text>
            </ComposeBadge>
        </ComposeHost>
    )
}
