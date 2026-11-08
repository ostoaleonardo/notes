import { useMemo } from 'react'
import { IconButton, InputChip as ComposeInputChip, Text } from '@expo/ui/jetpack-compose'
import { size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { ComposeIcon } from '@/ui/compose-icon'
import { useChipStyle } from '@/ui/hooks/use-chip-style'

import { ICON_SIZE, SIZE } from '@/ui/tokens/theme'

export const InputChip = ({
    children,
    trailingIcon,
    colors: overrides,
    selected = false,
    enabled = true,
    strikethrough = false,
    style,
    onPress,
    onTrailingPress
}) => {
    const { chipColors, border, textStyle } = useChipStyle({
        selected,
        overrides,
        trailing: !!trailingIcon,
        strikethrough
    })

    const trailingModifiers = useMemo(() => [sizeModifier(SIZE.xs, SIZE.xs)], [])

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
                    <Text style={textStyle}>
                        {children}
                    </Text>
                </ComposeInputChip.Label>
                {!!trailingIcon && (
                    <ComposeInputChip.TrailingIcon>
                        <IconButton
                            modifiers={trailingModifiers}
                            onClick={onTrailingPress}
                        >
                            <ComposeIcon
                                icon={trailingIcon}
                                size={ICON_SIZE.md}
                            />
                        </IconButton>
                    </ComposeInputChip.TrailingIcon>
                )}
            </ComposeInputChip>
        </ComposeHost>
    )
}
