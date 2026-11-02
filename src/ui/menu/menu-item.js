import { useMemo } from 'react'
import { DropdownMenuItem, Row, Text } from '@expo/ui/jetpack-compose'
import { Shapes, background, clip, height, offset, padding } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeIcon } from '@/ui/compose-icon'
import { useTheme } from '@/ui/hooks/use-theme'

import { FONTS, FONT_SIZE, ICON_SIZE, SIZE, SPACING } from '@/ui/tokens/theme'

const ROW_ARRANGEMENT = { spacedBy: SPACING.sm }
const TRAILING_MODIFIERS = [offset(SPACING.sm, 0)]

const renderIcon = (icon, color, modifiers) => (
    <ComposeIcon
        icon={icon}
        color={color}
        size={ICON_SIZE.lg}
        modifiers={modifiers}
    />
)

export function MenuItem({
    title,
    leadingIcon,
    trailingIcon,
    highlight,
    indent = 0,
    disabled = false,
    onPress
}) {
    const { colors } = useTheme()

    const elementColors = useMemo(() => ({
        textColor: colors.onBackground,
        trailingIconColor: colors.onBackground
    }), [colors.onBackground])

    const modifiers = useMemo(() => {
        const base = [
            padding(0, SPACING.xxxxs, 0, SPACING.xxxxs),
            height(SIZE.lg),
            clip(Shapes.RoundedCorner(SPACING.md))
        ]

        return highlight ? [...base, background(highlight)] : base
    }, [highlight])

    const textModifiers = useMemo(
        () => (indent ? [padding(indent, 0, 0, 0)] : undefined),
        [indent]
    )

    const textStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight,
        fontSize: FONT_SIZE.sm
    }), [])

    return (
        <DropdownMenuItem
            enabled={!disabled}
            modifiers={modifiers}
            elementColors={elementColors}
            onClick={onPress}
        >
            <DropdownMenuItem.Text>
                <Row horizontalArrangement={ROW_ARRANGEMENT} verticalAlignment='center'>
                    {!!leadingIcon && renderIcon(leadingIcon, colors.onBackground)}
                    <Text modifiers={textModifiers} style={textStyle}>
                        {title.toLocaleUpperCase()}
                    </Text>
                </Row>
            </DropdownMenuItem.Text>
            {!!trailingIcon && (
                <DropdownMenuItem.TrailingIcon>
                    {renderIcon(trailingIcon, colors.onBackground, TRAILING_MODIFIERS)}
                </DropdownMenuItem.TrailingIcon>
            )}
        </DropdownMenuItem>
    )
}
