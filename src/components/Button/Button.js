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
    let backgroundColor, borderWidth, borderColor, color

    switch (variant) {
        case 'primary':
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            borderWidth = 0
            color = COLORS.text
            break
        case 'secondary':
            backgroundColor = COLORS.text
            borderColor = COLORS.text
            borderWidth = 0
            color = COLORS.background
            break
        case 'outline':
            backgroundColor = COLORS.transparent
            borderColor = COLORS.text15
            borderWidth = 2
            color = COLORS.text
            break
        default:
            backgroundColor = COLORS.primary
            borderColor = COLORS.primary
            borderWidth = 0
            color = COLORS.text
            break
    }

    return StyleSheet.create({
        container: {
            width: '100%',
            padding: 16,
            borderColor,
            borderWidth,
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
