import { Pressable, StyleSheet } from 'react-native'
import { COLORS } from '@/constants'

const sizes = {
    sm: 32,
    md: 56,
    lg: 64,
}

export function IconButton({ icon, disabled, variant = 'primary', size = 'sm', onPress }) {
    const variantStyles = styles[variant]
    const iconSize = sizes[size]

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[
                styles.container,
                variantStyles,
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
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.text,
    },
    outline: {
        borderWidth: 2,
        borderColor: COLORS.text15,
        backgroundColor: COLORS.transparent,
    },
    light: {
        backgroundColor: COLORS.transparent,
    },
})
