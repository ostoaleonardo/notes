import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { useEffect, useEffectEvent, useState } from 'react'
import { useColorScheme } from 'react-native'

import { ErrorBoundary } from '@/components/error-boundary'

import { useLanguage } from '@/hooks/use-language'
import { usePurchasedPro } from '@/hooks/use-purchased-pro'
import { useStorage } from '@/hooks/use-storage'
import { ProProvider } from '@/context/pro-context'
import { ThemeProvider } from '@/context/theme-context'
import Providers from './providers'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { THEMES } from '@/constants/themes'
import { FREE_ACCENT, THEME_MODES } from '@/constants/theme-options'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary }

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { getItem } = useStorage()

    const [isReady, setIsReady] = useState(false)
    const [initialTheme, setInitialTheme] = useState({})
    const isPro = usePurchasedPro()

    const init = useEffectEvent(() => {
        initTheme()
            .catch((error) => logError(LOG_MESSAGES.ERROR_LOADING_APP, error))
            .finally(() => setIsReady(true))
    })

    useEffect(() => {
        init()
    }, [])

    const initTheme = async () => {
        const accent = await getItem(STORAGE_KEYS.ACCENT) || FREE_ACCENT
        const mode = await getItem(STORAGE_KEYS.THEME) || THEME_MODES.SYSTEM
        const name = mode !== THEME_MODES.SYSTEM ? mode : colorScheme
        const theme = THEMES[name]

        setInitialTheme({ mode, name, theme, accent })
        await initLanguage()
    }

    if (!isReady) {
        return null
    }

    return (
        <ProProvider isPro={isPro}>
            <ThemeProvider initialTheme={initialTheme}>
                <Providers>
                    <Slot />
                </Providers>
            </ThemeProvider>
        </ProProvider>
    )
}
