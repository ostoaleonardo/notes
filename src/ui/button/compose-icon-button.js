import { useMemo } from 'react'
import {
    Box,
    FilledIconButton,
    FilledTonalIconButton,
    IconButton,
    OutlinedIconButton,
    Text,
    TooltipBox
} from '@expo/ui/jetpack-compose'
import {
    Shapes,
    clip,
    size as sizeModifier,
    testID as testIdModifier
} from '@expo/ui/jetpack-compose/modifiers'

import { ComposeIcon } from '@/ui/compose-icon'
import { getButtonColors } from '@/ui/utils/compose-colors'
import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS, ICON_SIZE, SIZE } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

const COMPONENTS = {
    text: IconButton,
    filled: FilledIconButton,
    tonal: FilledTonalIconButton,
    outlined: OutlinedIconButton
}

export const DEFAULT_APPEARANCE = {
    tooltip: true,
    icon: ICON_SIZE.xxl,
    box: SIZE.sm
}

export const ComposeIconButton = ({
    variant,
    icon: Icon,
    label,
    onPress,
    testID,
    disabled = false,
    appearance
}) => {
    const { colors } = useTheme()
    const { tooltip, icon: size, box } = { ...DEFAULT_APPEARANCE, ...appearance }

    const Component = COMPONENTS[variant]
    const colorVariant = variant

    const buttonColors = useMemo(() => getButtonColors(colors, colorVariant), [colors, colorVariant])
    const iconColor = disabled
        ? buttonColors.contentColor + TINT.placeholder
        : buttonColors.contentColor

    const modifiers = useMemo(() => [
        ...(testID ? [testIdModifier(testID)] : [])
    ], [testID])

    const area = useMemo(() => [sizeModifier(box, box), clip(Shapes.Circle)], [box])

    const tooltipStyle = useMemo(() => ({ fontFamily: FONTS.azeretLight }), [])

    const button = (
        <Component
            colors={buttonColors}
            modifiers={modifiers}
            enabled={!disabled}
            onClick={onPress}
        >
            <Box contentAlignment='center' modifiers={area}>
                <ComposeIcon
                    icon={Icon}
                    size={size}
                    color={iconColor}
                    contentDescription={label}
                />
            </Box>
        </Component>
    )

    if (!tooltip) return button

    return (
        <TooltipBox>
            <TooltipBox.PlainTooltip>
                <Text style={tooltipStyle}>
                    {label}
                </Text>
            </TooltipBox.PlainTooltip>
            {button}
        </TooltipBox>
    )
}
