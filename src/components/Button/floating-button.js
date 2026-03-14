import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Plus } from '@/icons'
import { COLORS } from '@/constants'
import { useToggleMode } from '@/hooks'
import { ACCENT_COLORS } from '@/constants/themes'
import { useTheme } from 'react-native-paper'

export function FloatingButton({ href }) {
    const { colors } = useTheme()
    const { accent } = useToggleMode()
    const { background, onBackground } = ACCENT_COLORS[accent]

    return (
        <Link
            href={href}
            style={{
                ...styles.container,
                backgroundColor: colors.tertiary
            }}
        >
            <Plus
                width={24}
                height={24}
                color={onBackground}
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
