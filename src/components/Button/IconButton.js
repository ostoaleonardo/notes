import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { COLORS } from '@/constants'

export function IconButton({ icon, disabled, variant = 'primary', ...props }) {
    const { colors } = useTheme()
    const variantStyles = styles[variant]

    return (
        <Pressable
            {...props}
            disabled={disabled}
            style={[
                styles.container,
                variantStyles
            ]}
            android_ripple={{
                color: colors.onBackground + '1a',
                borderless: true,
                radius: 24
            }}
        >
            {icon}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        borderRadius: 32,
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
