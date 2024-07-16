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
                { width: iconSize, height: iconSize }
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
        justifyContent: 'center'
    },
    primary: {
        backgroundColor: COLORS.common.white
    },
    outline: {
        borderWidth: 1,
        borderColor: COLORS.common.white15
    },
    light: {
        backgroundColor: COLORS.common.transparent
    }
})
