import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { FloatingActionButton as ComposeFab, Icon as ComposeIcon } from '@expo/ui/jetpack-compose'
import { Shapes, clip } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { RADIUS, SPACING } from '@/ui/tokens/theme'

export function FloatingActionButton({ icon, label, onPress }) {
    const { colors } = useTheme()

    const modifiers = useMemo(() => [
        clip(Shapes.RoundedCorner(RADIUS.lg))
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
                        source={icon.source}
                        tint={colors.onTertiary}
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
