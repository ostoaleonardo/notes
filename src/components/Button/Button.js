import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

const COLOR_VARIANTS = {
    primary: COLORS.white,
    secondary: COLORS.background,
    outline: COLORS.white,
    flat: COLORS.white,
    light: COLORS.white
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
                variant='caption'
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
        padding: 18,
        borderRadius: 48,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    primary: {
        backgroundColor: COLORS.primary
    },
    secondary: {
        backgroundColor: COLORS.white
    },
    flat: {
        backgroundColor: COLORS.foreground
    },
    outline: {
        borderWidth: 1,
        borderColor: COLORS.white15
    },
})
