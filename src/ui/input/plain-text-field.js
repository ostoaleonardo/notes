import { useMemo } from 'react'
import { BasicTextField, Box, Host, Text } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { useTextState } from '@/ui/hooks/use-text-state'

import { PLAIN_INPUT } from '@/ui/tokens/components'

export function PlainTextField({
    value = '',
    onChangeText,
    placeholder,
    autoFocus = false,
    textStyle,
    cursorColor,
    selectionColors,
    placeholderColor
}) {
    const { text, onFocusChanged } = useTextState(value)
    const modifiers = useMemo(() => [fillMaxWidth()], [])

    return (
        <Host matchContents={PLAIN_INPUT.matchContents} style={PLAIN_INPUT.hostStyle}>
            <BasicTextField
                value={text}
                singleLine
                autoFocus={autoFocus}
                textStyle={textStyle}
                modifiers={modifiers}
                cursorColor={cursorColor}
                textSelectionColors={selectionColors}
                keyboardOptions={PLAIN_INPUT.keyboardOptions}
                onFocusChanged={onFocusChanged}
                onValueChange={onChangeText}
            >
                <BasicTextField.DecorationBox>
                    <Box>
                        {!!placeholder && (
                            <BasicTextField.Placeholder>
                                <Text color={placeholderColor} style={textStyle}>
                                    {placeholder}
                                </Text>
                            </BasicTextField.Placeholder>
                        )}
                        <BasicTextField.InnerTextField />
                    </Box>
                </BasicTextField.DecorationBox>
            </BasicTextField>
        </Host>
    )
}
