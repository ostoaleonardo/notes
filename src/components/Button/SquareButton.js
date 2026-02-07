import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Plus } from '@/icons'
import { COLORS } from '@/constants'

export function SquareButton({ onPress, disabled }) {
    const { colors } = useTheme()
    const alpha = disabled ? 'b3' : ''

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={{
                ...styles.pressable,
                backgroundColor: colors.tertiary + alpha
            }}
        >
            <Plus color={COLORS.base.white + alpha} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    pressable: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.base.accent
    }
})
