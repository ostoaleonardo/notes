import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Plus } from '@/icons'
import { COLORS } from '@/constants'

export function FloatingButton({ href }) {
    return (
        <Link
            href={href}
            style={styles.container}
        >
            <Plus
                width={24}
                height={24}
                color={COLORS.base.white}
            />
        </Link>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        padding: 24,
        borderRadius: 24,
        backgroundColor: COLORS.base.accent
    }
})
