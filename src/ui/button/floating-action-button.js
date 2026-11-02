import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { FloatingActionButton as ComposeFab } from '@expo/ui/jetpack-compose'
import { Shapes, clip, size } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { ComposeIcon } from '@/ui/compose-icon'
import { useTheme } from '@/ui/hooks/use-theme'

import { ICON_SIZE, RADIUS, SPACING } from '@/ui/tokens/theme'

const FAB_SIZE = ICON_SIZE.xxl + SPACING.xxl * 2

export function FloatingActionButton({ icon, label, onPress }) {
    const { colors } = useTheme()
    const modifiers = useMemo(() => [
        size(FAB_SIZE, FAB_SIZE),
        clip(Shapes.RoundedCorner(RADIUS.xl))
    ], [])

    return (
        <ComposeHost style={styles.container}>
            <ComposeFab
                containerColor={colors.tertiary}
                modifiers={modifiers}
                onClick={onPress}
            >
                <ComposeFab.Icon>
                    <ComposeIcon
                        icon={icon}
                        size={ICON_SIZE.xxl}
                        color={colors.onTertiary}
                        contentDescription={label}
                    />
                </ComposeFab.Icon>
            </ComposeFab>
        </ComposeHost>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg
    }
})
