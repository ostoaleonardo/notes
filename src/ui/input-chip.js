import { InputChip as ComposeInputChip, Text } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'
import { ComposeIcon } from '@/ui/compose-icon'
import { useChipStyle } from '@/ui/hooks/use-chip-style'

import { ICON_SIZE } from '@/ui/tokens/theme'

export const InputChip = ({
    children,
    trailingIcon,
    colors: overrides,
    selected = false,
    enabled = true,
    style,
    onPress
}) => {
    const { chipColors, border, textStyle } = useChipStyle({
        selected,
        overrides,
        trailing: !!trailingIcon
    })

    return (
        <ComposeHost style={style}>
            <ComposeInputChip
                selected={selected}
                enabled={enabled}
                colors={chipColors}
                border={border}
                onClick={onPress}
            >
                <ComposeInputChip.Label>
                    <Text style={textStyle}>{children}</Text>
                </ComposeInputChip.Label>
                {!!trailingIcon && (
                    <ComposeInputChip.TrailingIcon>
                        <ComposeIcon
                            icon={trailingIcon}
                            size={ICON_SIZE.md}
                        />
                    </ComposeInputChip.TrailingIcon>
                )}
            </ComposeInputChip>
        </ComposeHost>
    )
}
