import { FilterChip, RNHostView, Text } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'
import { useChipStyle } from '@/ui/hooks/use-chip-style'

export const Chip = ({
    children,
    leading,
    colors: overrides,
    selected = false,
    enabled = true,
    style,
    onPress
}) => {
    const { chipColors, border, textStyle } = useChipStyle({ selected, overrides })

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
