import { useMemo } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
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
    border,
    clickable,
    clip,
    matchParentSize,
    semantics,
    size as sizeModifier,
    testID as testIdModifier
} from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { ComposeIcon } from '@/ui/compose-icon'
import { getButtonColors } from '@/ui/utils/compose-colors'

import { BORDER_WIDTH, FONTS, ICON_SIZE, SIZE } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

const COMPONENTS = {
    text: IconButton,
    filled: FilledIconButton,
    tonal: FilledTonalIconButton,
    outlined: OutlinedIconButton
}

const DEFAULT_APPEARANCE = {
    tooltip: true,
    icon: ICON_SIZE.xxl,
    box: SIZE.sm
}

export function IconButtonBase({
    variant,
    icon: Icon,
    label,
    onPress,
    testID,
    disabled = false,
    appearance,
    style
}) {
    const { colors } = useTheme()
    const { tooltip, icon: size, box } = { ...DEFAULT_APPEARANCE, ...appearance }

    const Component = COMPONENTS[variant]
    const outlined = variant === 'outlined'
    const colorVariant = variant

    const buttonColors = useMemo(() => getButtonColors(colors, colorVariant), [colors, colorVariant])
    const iconColor = disabled
        ? buttonColors.contentColor + TINT.placeholder
        : buttonColors.contentColor

    const modifiers = useMemo(() => [
        semantics({ contentDescription: label }),
        ...(outlined ? [border(BORDER_WIDTH.thin, colors.outline)] : []),
        ...(testID ? [testIdModifier(testID)] : [])
    ], [label, outlined, colors.outline, testID])

    const area = useMemo(() => [sizeModifier(box, box), clip(Shapes.Circle)], [box])
    const overlay = useMemo(() => [matchParentSize(), clickable(onPress)], [onPress])
    const tooltipStyle = useMemo(() => ({ fontFamily: FONTS.azeretLight }), [])
    const inset = useMemo(() => ({ margin: Math.min(0, box - SIZE.lg) / 2 }), [box])

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
                />
                {!disabled && <Box modifiers={overlay} />}
            </Box>
        </Component>
    )

    return (
        <View style={inset}>
            <ComposeHost style={style}>
                {tooltip ? (
                    <TooltipBox>
                        <TooltipBox.PlainTooltip>
                            <Text style={tooltipStyle}>
                                {label}
                            </Text>
                        </TooltipBox.PlainTooltip>
                        {button}
                    </TooltipBox>
                ) : button}
            </ComposeHost>
        </View>
    )
}
