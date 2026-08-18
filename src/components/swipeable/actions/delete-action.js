import { Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { Delete } from '@/icons'

export function DeleteAction({ onPress, style }) {
    const { colors } = useTheme()

    return (
        <Pressable
            onPress={onPress}
            style={[styles.container, style, {
                backgroundColor: colors.tertiary
            }]}
        >
            <Delete color={colors.onTertiary} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        marginRight: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
