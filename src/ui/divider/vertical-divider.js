import { useMemo } from 'react'
import { VerticalDivider as ComposeVerticalDivider } from '@expo/ui/jetpack-compose'
import { fillMaxHeight } from '@expo/ui/jetpack-compose/modifiers'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { BORDER_WIDTH } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

export function VerticalDivider({ length, style }) {
    const { colors } = useTheme()
    const modifiers = useMemo(() => [fillMaxHeight()], [])
    const hostStyle = useMemo(() => [{ width: BORDER_WIDTH.thin, height: length }, style], [length, style])

    return (
        <ComposeHost matchContents={false} style={hostStyle}>
            <ComposeVerticalDivider
                thickness={BORDER_WIDTH.thin}
                color={colors.onBackground + TINT.border}
                modifiers={modifiers}
            />
        </ComposeHost>
    )
}
