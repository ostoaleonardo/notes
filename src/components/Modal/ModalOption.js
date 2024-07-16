import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Typography } from '../Text'
import { Check } from '../Check'

export function ModalOption({ onPress, label, isSelected }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
            android_ripple={{ color: colors.onBackground + '1a' }}
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
