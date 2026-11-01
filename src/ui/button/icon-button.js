import { useMemo } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import {
    Box,
    IconButton as ComposeIconButton,
    RNHostView,
    Text,
    TooltipBox
} from '@expo/ui/jetpack-compose'
import {
    Shapes,
    clickable,
    clip,
    matchParentSize,
    semantics,
    size,
    testID as testIdModifier
} from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'

import { FONTS, SIZE } from '@/ui/tokens/theme'
import { TINT, TRANSPARENT } from '@/ui/tokens/transparent'

export function IconButton({
    icon: Icon,
    label,
    onPress,
    testID,
    disabled = false,
    style
}) {
    const { colors } = useTheme()

    const buttonColors = useMemo(() => ({
        containerColor: TRANSPARENT.color,
        contentColor: colors.onBackground,
        disabledContainerColor: TRANSPARENT.color,
        disabledContentColor: colors.onBackground + TINT.placeholder
    }), [colors.onBackground])

    const modifiers = useMemo(() => [
        semantics({ contentDescription: label }),
        ...(testID ? [testIdModifier(testID)] : [])
    ], [label, testID])

    const iconColor = disabled ? colors.onBackground + TINT.placeholder : colors.onBackground
    const area = useMemo(() => [size(SIZE.lg, SIZE.lg), clip(Shapes.Circle)], [])
    const overlay = useMemo(() => [matchParentSize(), clickable(onPress)], [onPress])
    const tooltipStyle = useMemo(() => ({ fontFamily: FONTS.azeretLight }), [])

    return (
        <ComposeHost style={style}>
            <TooltipBox>
                <TooltipBox.PlainTooltip>
                    <Text style={tooltipStyle}>{label}</Text>
                </TooltipBox.PlainTooltip>
                <ComposeIconButton
                    colors={buttonColors}
                    modifiers={modifiers}
                    enabled={!disabled}
                    onClick={onPress}
                >
                    <Box contentAlignment='center' modifiers={area}>
                        <RNHostView matchContents>
                            <View pointerEvents='none'>
                                <Icon color={iconColor} />
                            </View>
                        </RNHostView>
                        {!disabled && <Box modifiers={overlay} />}
                    </Box>
                </ComposeIconButton>
            </TooltipBox>
        </ComposeHost>
    )
}
