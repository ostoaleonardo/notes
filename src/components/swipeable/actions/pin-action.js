import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Pressable } from 'react-native-gesture-handler'
import { Keep } from '@/icons'

export function PinAction({ onPress, style }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    return (
        <Pressable
            onPress={onPress}
            style={[styles.container, style, {
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
