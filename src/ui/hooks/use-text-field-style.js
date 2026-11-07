import { useMemo } from 'react'

import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

export function useTextFieldStyle() {
    const { colors } = useTheme()

    const textStyle = useMemo(() => ({
        color: colors.onBackground,
        fontFamily: FONTS.azeretLight
    }), [colors.onBackground])

    const selectionColors = useMemo(() => ({
        handleColor: colors.accentText,
        backgroundColor: colors.tertiary + TINT.highlight
    }), [colors.accentText, colors.tertiary])

    return { textStyle, selectionColors }
}
