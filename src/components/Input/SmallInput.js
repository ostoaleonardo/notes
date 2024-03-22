import { StyleSheet, TextInput } from 'react-native'
import { colors, fonts } from '@/constants'

export function SmallInput({ value, onChangeText, placeholder, variant }) {
    const styles = getStyles(variant)

    return (
        <TextInput
            value={value}
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={colors.primary}
            placeholderTextColor={colors.text50}
        />
    )
}

const getStyles = (variant) => {
    let backgroundColor, borderColor, color

    switch (variant) {
        case 'solid':
            backgroundColor = colors.foreground
            borderColor = colors.transparent
            color = colors.text
            break
        case 'ghost':
            backgroundColor = colors.transparent
            borderColor = colors.transparent
            color = colors.text
            break
        case 'outline':
            backgroundColor = colors.transparent
            borderColor = colors.text15
            color = colors.text
            break
        default:
            backgroundColor = colors.text15
            borderColor = colors.transparent
            color = colors.text
            break
    }

    return StyleSheet.create({
        input: {
            flex: 1,
            height: 72,
            padding: 16,
            fontSize: 14,
            borderColor,
            borderWidth: 2,
            backgroundColor,
            borderRadius: 16,
            color: colors.text,
            fontFamily: fonts.mono,
        },
    })
}
