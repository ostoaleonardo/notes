import { StyleSheet, TextInput } from 'react-native'
import { colors, fonts } from '../../constants'

export function LargeInput({ value, onChangeText, placeholder }) {
    return (
        <TextInput
            multiline
            value={value}
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            placeholderTextColor={`${colors.text}80`}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        fontSize: 24,
        color: colors.text,
        fontFamily: fonts.mono,
    },
})
