import { StyleSheet, TextInput } from 'react-native'
import { colors, fonts } from '@/constants'

export function LargeInput({ value, onChangeText, placeholder, ...props }) {
    return (
        <TextInput
            {...props}
            value={value}
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            placeholderTextColor={colors.text50}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 24,
        color: colors.text,
        fontFamily: fonts.mono,
    },
})
