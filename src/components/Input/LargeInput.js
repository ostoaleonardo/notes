import { StyleSheet, TextInput } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function LargeInput({ value, onChangeText, placeholder, ...props }) {
    return (
        <TextInput
            {...props}
            value={value}
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={COLORS.primary}
            placeholderTextColor={COLORS.text50}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 24,
        color: COLORS.text,
        fontFamily: FONTS.mono,
    },
})
