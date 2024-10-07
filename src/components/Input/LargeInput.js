import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function LargeInput({ value, onChangeText, placeholder, ...props }) {
    const { colors } = useTheme()
    const { tertiary, onBackground } = colors

    return (
        <TextInput
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
        width: '100%',
        fontSize: 24,
        fontFamily: FONTS.nType82Headline
    }
})
