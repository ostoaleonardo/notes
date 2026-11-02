import { useMemo } from 'react'
import { BasicTextField as ComposeBasicTextField, Box, Host, Text } from '@expo/ui/jetpack-compose'
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'

import { useTextState } from '@/ui/hooks/use-text-state'
import { useTheme } from '@/ui/hooks/use-theme'

import { PLAIN_INPUT } from '@/ui/tokens/components'

export function BasicTextField({
    value = '',
    onChangeText,
    placeholder,
    autoFocus = false,
    textStyle,
    cursorColor,
    selectionColors,
    placeholderColor
}) {
    const { dark } = useTheme()
    const { text, onFocusChanged } = useTextState(value)
    const modifiers = useMemo(() => [fillMaxWidth()], [])

    return (
        <Host
            colorScheme={dark ? 'dark' : 'light'}
            matchContents={PLAIN_INPUT.matchContents}
            style={PLAIN_INPUT.hostStyle}
        >
            <ComposeBasicTextField
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
                <ComposeBasicTextField.DecorationBox>
                    <Box>
                        {!!placeholder && (
                            <ComposeBasicTextField.Placeholder>
                                <Text color={placeholderColor} style={textStyle}>
                                    {placeholder}
                                </Text>
                            </ComposeBasicTextField.Placeholder>
                        )}
                        <ComposeBasicTextField.InnerTextField />
                    </Box>
                </ComposeBasicTextField.DecorationBox>
            </ComposeBasicTextField>
        </Host>
    )
}
