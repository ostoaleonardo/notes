import { useCallback, useMemo, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { Snackbar, SnackbarHost } from '@expo/ui/jetpack-compose'
import { border, fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ComposeHost } from '@/ui/compose-context'
import { paddingAround } from '@/ui/utils/compose-modifiers'
import { useTheme } from '@/ui/hooks/use-theme'

import { BORDER_WIDTH, SPACING } from '@/ui/tokens/theme'
import { TINT } from '@/ui/tokens/transparent'

let showMessage = null
let currentMessage = null

export const showSnackbar = (message) => {
    if (!showMessage || message === currentMessage) return

    currentMessage = message
    showMessage(message).finally(() => {
        if (currentMessage === message) currentMessage = null
    })
}

export function GlobalSnackbarHost() {
    const { colors } = useTheme()
    const { bottom } = useSafeAreaInsets()
    const ref = useRef(null)

    const register = useCallback((instance) => {
        ref.current = instance
        showMessage = instance
            ? (message) => instance.showSnackbar({ message })
            : null
    }, [])

    const modifiers = useMemo(() => [
        fillMaxWidth(),
        paddingAround(SPACING.sm, 0, SPACING.sm, bottom + SPACING.sm),
        border(BORDER_WIDTH.thin, colors.onBackground + TINT.border)
    ], [bottom, colors.onBackground])

    return (
        <ComposeHost style={styles.host}>
            <SnackbarHost ref={register}>
                <Snackbar
                    containerColor={colors.surface}
                    contentColor={colors.onBackground}
                    modifiers={modifiers}
                />
            </SnackbarHost>
        </ComposeHost>
    )
}

const styles = StyleSheet.create({
    host: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0
    }
})
