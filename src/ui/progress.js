import { useMemo } from 'react'
import { useTheme } from 'react-native-paper'
import { LoadingIndicator } from '@expo/ui/jetpack-compose'
import { size } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'

import { ICON_SIZE } from '@/ui/tokens/theme'

export function Progress({ dimension = ICON_SIZE.xxl }) {
    const { colors } = useTheme()
    const modifiers = useMemo(() => [size(dimension, dimension)], [dimension])

    return (
        <ComposeHost>
            <LoadingIndicator color={colors.onBackground} modifiers={modifiers} />
        </ComposeHost>
    )
}
