import { StyleSheet, TextInput } from 'react-native'
import { colors, fonts } from '../../constants'

export function SmallInput({ value, onChangeText, placeholder }) {
    return (
        <TextInput
            value={value}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.text50}
            onChangeText={onChangeText}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        height: 72,
        padding: 16,
        fontSize: 16,
        borderRadius: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        backgroundColor: colors.foreground,
    },
})
