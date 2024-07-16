import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function TextArea({ value, onChangeText, placeholder, ...props }) {
    const { colors } = useTheme()

    return (
        <View style={styles.inputContainer}>
            <TextInput
                {...props}
                multiline
                value={value}
                style={[
                    styles.input,
                    { color: colors.onBackground }
                ]}
                placeholder={placeholder}
                onChangeText={onChangeText}
                cursorColor={colors.tertiary}
                selectionColor={colors.tertiary}
                placeholderTextColor={colors.onBackground + '66'}
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
        fontFamily: FONTS.azeretLight
    }
})
