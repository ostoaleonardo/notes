import { StyleSheet, TextInput, View } from 'react-native'
import { colors, fonts } from '../../constants'

export function TextArea({ value, onChangeText, placeholder }) {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                multiline
                value={value}
                style={styles.input}
                placeholder={placeholder}
                onChangeText={onChangeText}
                placeholderTextColor={colors.text50}
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
        backgroundColor: colors.foreground,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
})
