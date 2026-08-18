import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Close } from '@/icons'

export function CloseChipButton({ onPress }) {
    const { colors } = useTheme()
    const { background } = colors

    return (
        <Pressable
            onPress={onPress}
            style={[styles.container, {
                backgroundColor: colors.background + '26'
            }]}
        >
            <Close
                width={16}
                height={16}
                color={background}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 16,
        height: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
