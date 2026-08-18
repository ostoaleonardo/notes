import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS, TRANSPARENT } from '@/constants'

export function LargeInput({ value, onChangeText, placeholder, modal, ...props }) {
    const { colors } = useTheme()
    const { tertiary, onBackground } = colors

    const InputComponent = TextInput

    return (
        <InputComponent
            {...props}
            value={value}
            style={{
                ...styles.input,
                color: onBackground
            }}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={onBackground}
            selectionHandleColor={tertiary}
            selectionColor={onBackground + TRANSPARENT[20]}
            placeholderTextColor={onBackground + TRANSPARENT[40]}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        flexGrow: 1,
        fontSize: 24,
        fontFamily: FONTS.nType82Headline
    }
})
