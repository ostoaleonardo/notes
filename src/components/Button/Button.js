import { Pressable, StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '@/constants'

export function Button({ label, onPress, disabled, variant, ...props }) {
    const styles = getStyles(variant)

    return (
        <Pressable
            {...props}
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
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            color = COLORS.text
            break
        case 'secondary':
            backgroundColor = COLORS.text
            borderColor = COLORS.text
            color = COLORS.background
            break
        case 'outline':
            backgroundColor = COLORS.transparent
            borderColor = COLORS.text15
            color = COLORS.text
            break
        default:
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            color = COLORS.text
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
            fontFamily: FONTS.mono,
            textTransform: 'uppercase',
        },
    })
}
