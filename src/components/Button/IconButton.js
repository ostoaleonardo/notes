import { Pressable, StyleSheet } from 'react-native'
import { colors } from '@/constants'

const sizes = {
    sm: 32,
    md: 56,
    lg: 64,
}

export function IconButton({ icon, variant = 'primary', size = 'sm', onPress }) {
    const variantStyles = styles[variant]
    const iconSize = sizes[size]

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                variantStyles,
                pressed && { opacity: 0.5 },
                { width: iconSize, height: iconSize },
            ]}
        >
            {icon}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.text,
    },
    outline: {
        borderWidth: 2,
        borderColor: colors.text15,
        backgroundColor: colors.transparent,
    },
    light: {
        backgroundColor: colors.transparent,
    },
})
