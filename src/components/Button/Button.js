import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

const COLOR_VARIANTS = {
    primary: COLORS.text,
    secondary: COLORS.background,
    outline: COLORS.text,
    flat: COLORS.text,
    light: COLORS.text,
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

            <Typography
                uppercase
                color={colorVariant}
            >
                {label}
            </Typography>
        </Pressable>
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
    primary: {
        color: COLORS.text,
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.text,
    },
    flat: {
        backgroundColor: COLORS.foreground,
    },
    outline: {
        borderWidth: 2,
        borderColor: COLORS.text10,
    },
})
