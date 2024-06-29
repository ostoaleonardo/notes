import { StyleSheet, TextInput } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function LargeInput({ value, onChangeText, bold, placeholder, ...props }) {
    return (
        <TextInput
            {...props}
            value={value}
            style={[
                styles.input,
                bold && styles.bold
            ]}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={COLORS.primary}
            placeholderTextColor={COLORS.white50}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        fontSize: 24,
        color: COLORS.white,
        fontFamily: FONTS.spaceMono
    },
    bold: {
        fontFamily: FONTS.spaceMonoBold
    }
})
