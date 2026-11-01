import { useContext, useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { RNHostView, Text } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeContext, ComposeHost } from '@/ui/compose-context'
import { useTextState } from '@/ui/hooks/use-text-state'

import { getTextFieldColors } from '@/ui/utils/compose-colors'

import { FILLED_INPUT } from '@/ui/tokens/components'
import { FONTS } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

const FILL_WIDTH = [fillMaxWidth()]

export function MaterialTextField({
    Field,
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
    const inCompose = useContext(ComposeContext)
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

    const field = (
        <Field
            ref={ref}
            value={text}
            colors={fieldColors}
            modifiers={inCompose ? FILL_WIDTH : undefined}
            textStyle={textStyle}
            autoFocus={autoFocus}
            singleLine={!multiline}
            keyboardOptions={FILLED_INPUT.keyboardOptions}
            textSelectionColors={selectionColors}
            onFocusChanged={onFocusChanged}
            onValueChange={onChangeText}
        >
            {!!startAdornment && (
                <Field.LeadingIcon>
                    <RNHostView matchContents>{startAdornment}</RNHostView>
                </Field.LeadingIcon>
            )}
            {!!endAdornment && (
                <Field.TrailingIcon>
                    <RNHostView matchContents>{endAdornment}</RNHostView>
                </Field.TrailingIcon>
            )}
            {!!label && (
                <Field.Label>
                    <Text style={labelStyle}>{label}</Text>
                </Field.Label>
            )}
            {!!placeholder && (
                <Field.Placeholder>
                    <Text style={labelStyle}>{placeholder}</Text>
                </Field.Placeholder>
            )}
        </Field>
    )

    return (
        <ComposeHost matchContents={FILLED_INPUT.matchContents} style={FILLED_INPUT.hostStyle}>
            {field}
        </ComposeHost>
    )
}
