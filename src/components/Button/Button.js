import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '../Text'

export function Button({ label, onPress, disabled, isLoading, variant = 'primary', ...props }) {
    const { colors } = useTheme()

    const VARIANTS = {
        primary: {
            color: colors.onTertiary,
            backgroundColor: colors.tertiary,
            borderColor: colors.transparent
        },
        secondary: {
            color: colors.onBackground,
            backgroundColor: colors.surface,
            borderColor: colors.transparent
        },
        flat: {
            color: colors.onSurface,
            backgroundColor: colors.surface,
            borderColor: colors.transparent
        },
        outline: {
            color: colors.onBackground,
            backgroundColor: colors.transparent,
            borderColor: colors.outline
        },
        light: {
            color: colors.onBackground,
            backgroundColor: colors.transparent,
            borderColor: colors.transparent
        }
    }

    const { color, backgroundColor, borderColor } = VARIANTS[variant]

    return (
        <Pressable
            {...props}
            onPress={onPress}
            disabled={disabled || isLoading}
            style={[
                styles.base,
                disabled && { opacity: 0.5 },
                { backgroundColor, borderColor }
            ]}
        >
            {isLoading && <ActivityIndicator color={color} />}

            <Typography
                uppercase
                color={color}
                variant='caption'
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
        borderWidth: 1,
        borderRadius: 48,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    }
})
