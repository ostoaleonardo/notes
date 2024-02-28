import { StyleSheet, Text } from 'react-native'
import { Link } from 'expo-router'
import { colors, fonts } from '../../constants'

export function FloatingButton({ label, href }) {
    return (
        <Link href={href} style={styles.linkContainer}>
            <Text style={styles.text}>{label}</Text>
        </Link>
    )
}

const styles = StyleSheet.create({
    linkContainer: {
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
