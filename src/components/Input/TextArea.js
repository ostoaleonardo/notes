import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function TextArea({ value, onChangeText, placeholder, ...props }) {
    const { colors } = useTheme()
    const { onBackground, tertiary } = colors

    return (
        <View style={styles.inputContainer}>
            <TextInput
                {...props}
                multiline
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
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%'
    },
    input: {
        fontSize: 14,
        fontFamily: FONTS.azeretLight
    }
})
