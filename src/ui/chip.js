import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { FilterChip, Text } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'

import { FONTS } from '@/ui/tokens/theme'
import { TRANSPARENT } from '@/ui/tokens/transparent'

export function Chip({ children, selected = false, onPress }) {
    const { colors } = useTheme()

    const chipColors = useMemo(() => ({
        containerColor: colors.surfaceVariant,
        labelColor: colors.onBackground,
        selectedContainerColor: colors.onBackground,
        selectedLabelColor: colors.background
    }), [colors.surfaceVariant, colors.onBackground, colors.background])
    const border = useMemo(() => ({ width: 0, color: TRANSPARENT.color }), [])
    const textStyle = useMemo(() => ({
        fontFamily: selected ? FONTS.azeretMedium : FONTS.azeretLight
    }), [selected])

    return (
        <ComposeHost>
            <FilterChip
                selected={selected}
                colors={chipColors}
                border={border}
                onClick={onPress}
            >
                <FilterChip.Label>
                    <Text style={textStyle}>{children}</Text>
                </FilterChip.Label>
            </FilterChip>
        </ComposeHost>
    )
}
