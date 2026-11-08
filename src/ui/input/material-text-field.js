import { useCallback, useContext, useMemo } from 'react'
import { Text } from '@expo/ui/jetpack-compose'
import { fillMaxWidth, testID as testIdModifier } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeContext, ComposeHost } from '@/ui/compose-context'
import { useTextState } from '@/ui/hooks/use-text-state'
import { useTheme } from '@/ui/hooks/use-theme'
import { useTextFieldStyle } from '@/ui/hooks/use-text-field-style'

import { getTextFieldColors } from '@/ui/utils/compose-colors'

import { FILLED_INPUT } from '@/ui/tokens/components'
import { FONTS } from '@/ui/tokens/theme'

const FILL_WIDTH = [fillMaxWidth()]

export const MaterialTextField = ({
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
    disabled = false,
    autoFocus = false,
    syncWhileFocused = false,
    testID
}) => {
    const { colors } = useTheme()
    const { text, onFocusChanged, onTyped } = useTextState(value, syncWhileFocused)
    const onValueChange = useCallback((next) => {
        onTyped(next)
        onChangeText?.(next)
    }, [onTyped, onChangeText])
    const { textStyle, selectionColors } = useTextFieldStyle()
    const inCompose = useContext(ComposeContext)

    const fieldColors = useMemo(() => getTextFieldColors(colors, containerColor), [colors, containerColor])

    const modifiers = useMemo(() => {
        const list = [...(inCompose ? FILL_WIDTH : []), ...(testID ? [testIdModifier(testID)] : [])]
        return list.length ? list : undefined
    }, [inCompose, testID])

    const labelStyle = useMemo(() => ({
        fontFamily: FONTS.azeretLight
    }), [])

    const field = (
        <Field
            ref={ref}
            value={text}
            colors={fieldColors}
            modifiers={modifiers}
            textStyle={textStyle}
            enabled={!disabled}
            autoFocus={autoFocus}
            singleLine={!multiline}
            keyboardOptions={FILLED_INPUT.keyboardOptions}
            textSelectionColors={selectionColors}
            onFocusChanged={onFocusChanged}
            onValueChange={onValueChange}
        >
            {!!startAdornment && (
                <Field.LeadingIcon>
                    {startAdornment}
                </Field.LeadingIcon>
            )}
            {!!endAdornment && (
                <Field.TrailingIcon>
                    {endAdornment}
                </Field.TrailingIcon>
            )}
            {!!label && (
                <Field.Label>
                    <Text style={labelStyle}>
                        {label}
                    </Text>
                </Field.Label>
            )}
            {!!placeholder && (
                <Field.Placeholder>
                    <Text style={labelStyle}>
                        {placeholder}
                    </Text>
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
