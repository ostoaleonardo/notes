import { Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function SquareButton({ onPress, disabled, label }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.container,
                disabled && { opacity: 0.5 }
            ]}
        >
            <Typography
                uppercase
                variant='caption'
            >
                {label}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 72,
        height: 72,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
})
