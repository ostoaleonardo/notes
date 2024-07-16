import { StyleSheet, TextInput } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FONTS } from '@/constants'

export function SmallInput({ value, onChangeText, placeholder }) {
    const { colors } = useTheme()

    return (
        <TextInput
            value={value}
            style={[
                styles.base,
                { color: colors.onBackground },
                { borderBottomColor: colors.onBackground + '66' }
            ]}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={colors.tertiary}
            placeholderTextColor={colors.onBackground + '66'}
        />
    )
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        height: 72,
        fontSize: 14,
        borderBottomWidth: 1,
        fontFamily: FONTS.azeretLight
    }
})
