import { StyleSheet, TextInput, View } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function TextArea({ value, onChangeText, placeholder, ...props }) {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                {...props}
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
        minHeight: 250
    },
    input: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily: FONTS.azeretMedium
    },
})
