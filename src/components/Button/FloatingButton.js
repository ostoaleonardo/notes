import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Typography } from '../Text'
import { colors } from '@/constants'

export function FloatingButton({ label, href }) {
    return (
        <Link
            href={href}
            style={styles.container}
        >
            <Typography
                uppercase
                variant='paragraph'
            >
                {label}
            </Typography>
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
})
