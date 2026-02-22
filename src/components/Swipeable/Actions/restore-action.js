import { StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Pressable } from 'react-native-gesture-handler'
import { History } from '@/icons'

export function RestoreAction({ onPress }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    return (
        <Pressable
            onPress={onPress}
            style={[styles.container, {
                backgroundColor: onBackground
            }]}
        >
            <History color={background} />
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
