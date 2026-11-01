import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { Host, RNHostView, Text, TextField } from '@expo/ui/jetpack-compose'

import { useTextState } from '@/ui/hooks/use-text-state'

import { getTextFieldColors } from '@/ui/utils/compose-colors'

import { FILLED_INPUT } from '@/ui/tokens/components'
import { FONTS } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

export function FilledTextField({
    label,
    value = '',
    onChangeText,
    placeholder,
    containerColor,
    startAdornment,
    endAdornment,
    ref,
    multiline = true,
    autoFocus = false
}) {
    const { colors } = useTheme()
    const { text, onFocusChanged } = useTextState(value)
    const fieldColors = useMemo(() => getTextFieldColors(colors, containerColor), [colors, containerColor])

    const textStyle = useMemo(() => ({
        color: colors.onBackground,
        fontFamily: FONTS.azeretLight
    }), [colors.onBackground])

    const labelStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight
    }), [])

    const selectionColors = useMemo(() => ({
        handleColor: colors.accentText,
        backgroundColor: colors.tertiary + TINT.highlight
    }), [colors.accentText, colors.tertiary])

    return (
        <Host matchContents={FILLED_INPUT.matchContents} style={FILLED_INPUT.hostStyle}>
            <TextField
                ref={ref}
                value={text}
                colors={fieldColors}
                textStyle={textStyle}
                autoFocus={autoFocus}
                singleLine={!multiline}
                keyboardOptions={FILLED_INPUT.keyboardOptions}
                textSelectionColors={selectionColors}
                onFocusChanged={onFocusChanged}
                onValueChange={onChangeText}
            >
                {!!startAdornment && (
                    <TextField.LeadingIcon>
                        <RNHostView matchContents>{startAdornment}</RNHostView>
                    </TextField.LeadingIcon>
                )}
                {!!endAdornment && (
                    <TextField.TrailingIcon>
                        <RNHostView matchContents>{endAdornment}</RNHostView>
                    </TextField.TrailingIcon>
                )}
                {!!label && (
                    <TextField.Label>
                        <Text style={labelStyle}>{label}</Text>
                    </TextField.Label>
                )}
                {!!placeholder && (
                    <TextField.Placeholder>
                        <Text style={labelStyle}>{placeholder}</Text>
                    </TextField.Placeholder>
                )}
            </TextField>
        </Host>
    )
}
