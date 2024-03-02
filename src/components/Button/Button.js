import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, fonts } from '../../constants'

export function Button({ label, onPress, variant = 'primary' || 'secondary' }) {
    const buttonStyles = variant === 'primary' ? styles.primaryButton : styles.secondaryButton
    const labelStyles = variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel

    return (
        <Pressable
            onPress={onPress}
            style={buttonStyles}
        >
            <Text style={labelStyles}>
                {label}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    primaryButton: {
        width: '100%',
        padding: 16,
        borderRadius: 48,
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    primaryLabel: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
    secondaryButton: {
        width: '100%',
        padding: 16,
        borderWidth: 2,
        borderRadius: 48,
        alignItems: 'center',
        borderColor: colors.text50,
    },
    secondaryLabel: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
})
