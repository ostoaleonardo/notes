import { useEffect, useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import {
    Host,
    Text,
    TextField,
    useNativeState
} from '@expo/ui/jetpack-compose'

import { getTextFieldColors } from '@/utils/compose-colors'

import { FILLED_INPUT } from '@/constants/components'
import { FONTS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export function FilledTextField({
    label,
    value = '',
    onChangeText,
    placeholder,
    multiline = true,
    autoFocus = false
}) {
    const { colors } = useTheme()
    const text = useNativeState(value)
    const fieldColors = useMemo(() => getTextFieldColors(colors), [colors])
    const textStyle = useMemo(() => ({
        color: colors.onBackground,
        fontFamily: FONTS.azeretLight,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodyMedium
    }), [colors.onBackground])
    const labelStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight,
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall
    }), [])
    const selectionColors = useMemo(() => ({
        handleColor: colors.accentText,
        backgroundColor: colors.tertiary + TRANSPARENT[30]
    }), [colors.accentText, colors.tertiary])

    useEffect(() => {
        if (text.value !== value) text.value = value
    }, [text, value])

    return (
        <Host matchContents={{ vertical: true }} style={FIELD_STYLE}>
            <TextField
                value={text}
                colors={fieldColors}
                textStyle={textStyle}
                autoFocus={autoFocus}
                singleLine={!multiline}
                keyboardOptions={FILLED_INPUT.keyboardOptions}
                textSelectionColors={selectionColors}
                onValueChange={onChangeText}
            >
                <TextField.Label>
                    <Text style={labelStyle}>{label}</Text>
                </TextField.Label>
                {!!placeholder && (
                    <TextField.Placeholder>
                        <Text style={labelStyle}>{placeholder}</Text>
                    </TextField.Placeholder>
                )}
            </TextField>
        </Host>
    )
}

const FIELD_STYLE = { width: '100%', minHeight: FILLED_INPUT.minHeight }
