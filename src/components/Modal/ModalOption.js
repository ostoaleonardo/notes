import { Pressable, StyleSheet, View } from 'react-native'
import { Typography } from '../Text'
import { Check } from '../Check'
import { COLORS } from '@/constants'

export function ModalOption({ onPress, label, isSelected }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: COLORS.white5 }}
        >
            <Typography>
                {label}
            </Typography>
            <Check checked={isSelected} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
