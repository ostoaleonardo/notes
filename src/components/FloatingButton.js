import { Pressable, StyleSheet, Text } from 'react-native'
import { Link } from 'expo-router'
import { colors, fonts } from '../constants'

export function FloatingButton() {
    return (
        <Link href='/note' style={styles.container}>
            <Pressable>
                <Text style={styles.text}>+ Add Note</Text>
            </Pressable>
        </Link>
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
