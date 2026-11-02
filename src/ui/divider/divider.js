import { HorizontalDivider } from '@expo/ui/jetpack-compose'

import { ComposeHost } from '@/ui/compose-context'
import { useTheme } from '@/ui/hooks/use-theme'

import { COMPOSE_DIVIDER } from '@/ui/tokens/components'
import { BORDER_WIDTH } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

export function Divider() {
    const { colors } = useTheme()

    return (
        <ComposeHost
            matchContents={COMPOSE_DIVIDER.matchContents}
            style={COMPOSE_DIVIDER.hostStyle}
        >
            <HorizontalDivider
                thickness={BORDER_WIDTH.thin}
                color={colors.onBackground + TINT.border}
            />
        </ComposeHost>
    )
}
