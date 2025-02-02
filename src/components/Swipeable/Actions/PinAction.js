import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Keep } from '@/icons'

export function PinAction({ onPress }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    return (
        <Pressable
            onPress={onPress}
            style={[styles.container, {
                backgroundColor: onBackground
            }]}
        >
            <Keep color={background} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        marginLeft: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
