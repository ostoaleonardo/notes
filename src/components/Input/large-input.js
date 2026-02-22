import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { FONTS } from '@/constants'

export function LargeInput({ value, onChangeText, placeholder, modal, ...props }) {
    const { colors } = useTheme()
    const { tertiary, onBackground } = colors

    const InputComponent = modal ? BottomSheetTextInput : TextInput

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
            selectionColor={onBackground + '33'}
            placeholderTextColor={onBackground + '66'}
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
