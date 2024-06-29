import { StyleSheet, TextInput } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function SmallInput({ value, onChangeText, placeholder, variant }) {
    const styles = getStyles(variant)

    return (
        <TextInput
            value={value}
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            cursorColor={COLORS.primary}
            placeholderTextColor={COLORS.text50}
        />
    )
}

const getStyles = (variant) => {
    let backgroundColor, borderColor, color

    switch (variant) {
        case 'solid':
            backgroundColor = COLORS.foreground
            borderColor = COLORS.transparent
            color = COLORS.text
            break
        case 'ghost':
            backgroundColor = COLORS.transparent
            borderColor = COLORS.transparent
            color = COLORS.text
            break
        case 'outline':
            backgroundColor = COLORS.transparent
            borderColor = COLORS.text15
            color = COLORS.text
            break
        default:
            backgroundColor = COLORS.text15
            borderColor = COLORS.transparent
            color = COLORS.text
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
            color: COLORS.text,
            fontFamily: FONTS.spaceMono,
        },
    })
}
