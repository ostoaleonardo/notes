import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { useEffect, useEffectEvent, useState } from 'react'
import { useColorScheme } from 'react-native'
import { useLocales } from 'expo-localization'

import { ErrorBoundary } from '@/shared/components/error-boundary'

import { useLanguage } from '@/shared/hooks/use-language'
import { useRouteTracker } from '@/shared/hooks/use-route-tracker'
import { usePurchasedPro } from '@/shared/hooks/use-purchased-pro'
import { useStorage } from '@/shared/hooks/use-storage'
import { ProProvider } from '@/shared/context/pro-context'
import { HeadingFontProvider } from '@/shared/context/heading-font-provider'
import { ThemeProvider } from '@/shared/context/theme-context'
import Providers from './providers'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { THEMES } from '@/shared/constants/themes'
import { FREE_ACCENT, THEME_MODES } from '@/shared/constants/theme-options'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { loadBundledContent } from '@/shared/utils/bundled-content'
import { logError } from '@/shared/utils/log-error'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary }

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage, syncSystemLanguage } = useLanguage()
    const locales = useLocales()
    const { getItem } = useStorage()
    useRouteTracker()

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

    const syncLanguage = useEffectEvent(() => {
        syncSystemLanguage()
    })

    useEffect(() => {
        syncLanguage()
    }, [locales])

    const initTheme = async () => {
        const accent = await getItem(STORAGE_KEYS.ACCENT) || FREE_ACCENT
        const mode = await getItem(STORAGE_KEYS.THEME) || THEME_MODES.SYSTEM
        const name = mode !== THEME_MODES.SYSTEM ? mode : colorScheme
        const theme = THEMES[name]

        setInitialTheme({ mode, name, theme, accent })
        await initLanguage()
        await loadBundledContent()
    }

    if (!isReady) {
        return null
    }

    return (
        <ProProvider isPro={isPro}>
            <HeadingFontProvider>
                <ThemeProvider initialTheme={initialTheme}>
                    <Providers>
                        <Slot />
                    </Providers>
                </ThemeProvider>
            </HeadingFontProvider>
        </ProProvider>
    )
}
