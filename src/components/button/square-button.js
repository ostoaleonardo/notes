import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Plus } from '@/icons/plus'

import { COLORS, RADIUS, TRANSPARENT } from '@/constants/themes'

export function SquareButton({ onPress, disabled }) {
    const { colors } = useTheme()
    const alpha = disabled ? TRANSPARENT[70] : ''

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={{
                ...styles.pressable,
                backgroundColor: colors.tertiary + alpha
            }}
        >
            <Plus color={colors.onTertiary + alpha} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    pressable: {
        width: 64,
        height: 64,
        borderRadius: RADIUS.outer,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.base.accent
    }
})
