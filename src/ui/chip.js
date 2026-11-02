import { useMemo } from 'react'
import { FilterChip, RNHostView, Text } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS } from '@/ui/tokens/theme'
import { TRANSPARENT } from '@/ui/tokens/transparent'

export function Chip({
    children,
    leading,
    colors: overrides,
    selected = false,
    enabled = true,
    style,
    onPress
}) {
    const { colors } = useTheme()

    const chipColors = useMemo(() => ({
        containerColor: colors.surfaceVariant,
        labelColor: colors.onBackground,
        selectedContainerColor: colors.onBackground,
        selectedLabelColor: colors.background,
        ...overrides
    }), [colors.surfaceVariant, colors.onBackground, colors.background, overrides])
    const border = useMemo(() => ({ width: 0, color: TRANSPARENT.color }), [])
    const textStyle = useMemo(() => ({
        fontFamily: selected ? FONTS.azeretMedium : FONTS.azeretLight
    }), [selected])

    return (
        <ComposeHost style={style}>
            <FilterChip
                selected={selected}
                enabled={enabled}
                colors={chipColors}
                border={border}
                onClick={onPress}
            >
                {!!leading && (
                    <FilterChip.LeadingIcon>
                        <RNHostView matchContents>{leading}</RNHostView>
                    </FilterChip.LeadingIcon>
                )}
                <FilterChip.Label>
                    <Text style={textStyle}>{children}</Text>
                </FilterChip.Label>
            </FilterChip>
        </ComposeHost>
    )
}
