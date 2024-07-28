import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function LargeInput({ value, onChangeText, bold, placeholder, ...props }) {
    const { colors } = useTheme()

    return (
        <TextInput
            {...props}
            value={value}
            style={[
                styles.input,
                bold && styles.bold,
                { color: colors.onBackground }
            ]}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={colors.onBackground}
            selectionHandleColor={colors.tertiary}
            selectionColor={colors.onBackground + '33'}
            placeholderTextColor={colors.onBackground + '66'}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        fontSize: 24,
        fontFamily: FONTS.azeretLight
    },
    bold: {
        fontFamily: FONTS.azeretMedium
    }
})
