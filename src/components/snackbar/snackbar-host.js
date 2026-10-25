import { useEffect, useState } from 'react'
import { Snackbar, useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Typography } from '@/components/typography'

import { TRANSPARENT } from '@/constants/themes'
import { BORDER_WIDTH, RADIUS, SPACING } from '@/constants/theme'

let listener = null
let currentMessage = null

export const showSnackbar = (message) => {
    if (message === currentMessage) return
    listener?.(message)
}

export function GlobalSnackbarHost() {
    const { colors } = useTheme()
    const { bottom } = useSafeAreaInsets()
    const [message, setMessage] = useState(null)

    useEffect(() => {
        listener = (next) => {
            currentMessage = next
            setMessage(next)
        }

        return () => { listener = null }
    }, [])

    const onDismiss = () => {
        currentMessage = null
        setMessage(null)
    }

    return (
        <Snackbar
            visible={!!message}
            onDismiss={onDismiss}
            wrapperStyle={{
                paddingHorizontal: SPACING.sm,
                paddingBottom: bottom + SPACING.sm
            }}
            style={{
                borderRadius: RADIUS.md,
                borderWidth: BORDER_WIDTH.thin,
                borderColor: colors.onBackground + TRANSPARENT[20],
                backgroundColor: colors.surface
            }}
        >
            <Typography color={colors.onBackground}>
                {message}
            </Typography>
        </Snackbar>
    )
}
