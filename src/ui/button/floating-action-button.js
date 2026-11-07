import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FloatingActionButton as ComposeFab, Icon as ComposeIcon } from '@expo/ui/jetpack-compose'
import { Shapes, clip, testID as testIdModifier } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { RADIUS, SPACING } from '@/ui/tokens/theme'

export const FloatingActionButton = ({
    icon,
    label,
    testID,
    onPress
}) => {
    const { colors } = useTheme()
    const { bottom } = useSafeAreaInsets()

    const modifiers = useMemo(() => [
        clip(Shapes.RoundedCorner(RADIUS.lg)),
        ...(testID ? [testIdModifier(testID)] : [])
    ], [testID])

    return (
        <ComposeHost style={[styles.container, { bottom: bottom + SPACING.lg }]}>
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
        right: SPACING.lg
    }
})
