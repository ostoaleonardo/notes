import { StyleSheet, TextInput, View } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function TextArea({ value, onChangeText, placeholder }) {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                multiline
                value={value}
                style={styles.input}
                placeholder={placeholder}
                onChangeText={onChangeText}
                cursorColor={COLORS.primary}
                placeholderTextColor={COLORS.text50}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        minHeight: 200,
        padding: 16,
        borderRadius: 16,
        backgroundColor: COLORS.foreground,
    },
    input: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily: FONTS.mono,
    },
})
