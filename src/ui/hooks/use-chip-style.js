import { useMemo } from 'react'

import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS } from '@/ui/tokens/theme'
import { TRANSPARENT } from '@/ui/tokens/transparent'

const BORDER = { width: 0, color: TRANSPARENT.color }

export const useChipStyle = ({ selected, overrides, trailing = false, strikethrough = false }) => {
    const { colors } = useTheme()

    const chipColors = useMemo(() => ({
        containerColor: colors.surfaceVariant,
        labelColor: colors.onBackground,
        selectedContainerColor: colors.onBackground,
        selectedLabelColor: colors.background,
        ...(trailing && {
            trailingIconColor: colors.onBackground,
            selectedTrailingIconColor: colors.background
        }),
        ...overrides
    }), [colors.surfaceVariant, colors.onBackground, colors.background, trailing, overrides])

    const textStyle = useMemo(() => ({
        fontFamily: selected ? FONTS.azeretMedium : FONTS.azeretLight,
        ...(strikethrough && { textDecoration: 'lineThrough' })
    }), [selected, strikethrough])

    return { chipColors, border: BORDER, textStyle }
}
