import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { COLORS, FONTS } from '@/constants'

const COLOR_VARIANTS = {
    primary: COLORS.text,
    secondary: COLORS.background,
    outline: COLORS.text
}

export function Button({ label, onPress, disabled, isLoading, variant = 'primary', ...props }) {
    const buttonVariant = styles[variant]
    const colorVariant = COLOR_VARIANTS[variant]

    return (
        <Pressable
            {...props}
            onPress={onPress}
            disabled={disabled || isLoading}
            style={[
                styles.base,
                buttonVariant,
                disabled && { opacity: 0.5 }
            ]}
        >
            {isLoading && <ActivityIndicator color={colorVariant} />}

            <Text
                style={[
                    styles.label,
                    { color: colorVariant }
                ]}
            >
                {label}
            </Text>
        </Pressable >
    )
}

const styles = StyleSheet.create({
    base: {
        width: '100%',
        gap: 16,
        padding: 16,
        borderRadius: 48,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.mono,
        textTransform: 'uppercase',
    },
    primary: {
        color: COLORS.text,
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.text,
    },
    outline: {
        borderWidth: 2,
        borderColor: COLORS.text15,
    },
})
