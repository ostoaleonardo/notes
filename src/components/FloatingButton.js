import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, fonts } from '../constants'

export function FloatingButton() {
    return (
        <Pressable style={styles.container}>
            <Text style={styles.text}>+ Add Note</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 32,
        right: 32,
        borderRadius: 48,
        paddingVertical: 24,
        paddingHorizontal: 32,
        backgroundColor: colors.primary,
    },
    text: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
})
