import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function FloatingButton({ label, href }) {
    return (
        <Link
            href={href}
            style={styles.container}
        >
            <Typography
                uppercase
            >
                {label}
            </Typography>
        </Link>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 48,
        paddingVertical: 24,
        paddingHorizontal: 32,
        backgroundColor: COLORS.primary,
    },
})
