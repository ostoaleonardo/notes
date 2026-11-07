import { useMemo } from 'react'
import { Badge as ComposeBadge, Text } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS, FONT_SIZE } from '@/ui/tokens/theme'

export const Badge = ({ children, style }) => {
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
