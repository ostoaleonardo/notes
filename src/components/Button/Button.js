import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, fonts } from '@/constants'

export function Button({ label, onPress, disabled, variant }) {
    const styles = getStyles(variant)

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.container,
                disabled && { opacity: 0.5 }
            ]}
        >
            <Text style={styles.label}>
                {label}
            </Text>
        </Pressable>
    )
}

const getStyles = (variant) => {
    let backgroundColor, borderColor, color

    switch (variant) {
        case 'primary':
            backgroundColor = colors.primary
            borderColor = colors.primary
            color = colors.text
            break
        case 'secondary':
            backgroundColor = colors.text
            borderColor = colors.text
            color = colors.background
            break
        case 'outline':
            backgroundColor = colors.transparent
            borderColor = colors.text15
            color = colors.text
            break
        default:
            backgroundColor = colors.primary
            borderColor = colors.primary
            color = colors.text
            break
    }

    return StyleSheet.create({
        container: {
            width: '100%',
            padding: 16,
            borderColor,
            borderWidth: 2,
            backgroundColor,
            borderRadius: 48,
            alignItems: 'center',
        },
        label: {
            color,
            fontSize: 14,
            fontFamily: fonts.mono,
            textTransform: 'uppercase',
        },
    })
}
