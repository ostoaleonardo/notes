import { useMemo } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { DropdownMenuItem, RNHostView, Row, Text } from '@expo/ui/jetpack-compose'
import { Shapes, background, clip, height, padding } from '@expo/ui/jetpack-compose/modifiers'

import { FONTS, FONT_SIZE, ICON_SIZE, RADIUS, SIZE, SPACING } from '@/ui/tokens/theme'

const ROW_ARRANGEMENT = { spacedBy: SPACING.sm }
const SELECTED_RADIUS = SPACING.md

const renderIcon = (icon, color) => (
    <RNHostView matchContents>
        <View pointerEvents='none'>
            {icon({ color, width: ICON_SIZE.lg, height: ICON_SIZE.lg })}
        </View>
    </RNHostView>
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
        trailingIconColor: colors.accentText
    }), [colors.onBackground, colors.accentText])
    const modifiers = useMemo(() => {
        const base = [
            padding(0, SPACING.xxxs / 2, 0, SPACING.xxxs / 2),
            height(SIZE.lg),
            clip(Shapes.RoundedCorner(highlight ? SELECTED_RADIUS : RADIUS.xs))
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
                    {renderIcon(trailingIcon, colors.accentText)}
                </DropdownMenuItem.TrailingIcon>
            )}
        </DropdownMenuItem>
    )
}
