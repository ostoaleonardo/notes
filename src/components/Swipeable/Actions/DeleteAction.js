import { Pressable, StyleSheet } from 'react-native'
import { Delete } from '@/icons'
import { COLORS } from '@/constants'

export function DeleteAction({ onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            <Delete color={COLORS.base.white} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        marginRight: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.base.accent
    }
})
