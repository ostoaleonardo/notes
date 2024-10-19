import { Pressable, StyleSheet } from 'react-native'
import { Typography } from '../Typography'
import { COLORS } from '@/constants'

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
                color={COLORS.base.white}
            >
                {label}
            </Typography>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 'auto',
        minWidth: 72,
        height: 72,
        borderRadius: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.base.accent
    }
})
