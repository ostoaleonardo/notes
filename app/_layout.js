import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

import { ErrorBoundary } from '@/components/error-boundary'

import { useLanguage } from '@/hooks/use-language'
import { usePurchasedPro } from '@/hooks/use-purchased-pro'
import { useStorage } from '@/hooks/use-storage'
import { ProProvider } from '@/context/pro-context'
import { ThemeProvider } from '@/context/theme-context'
import Providers from './providers'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { FREE_ACCENT, THEMES } from '@/constants/themes'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary }

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { getItem } = useStorage()

    const [isReady, setIsReady] = useState(false)
    const [initialTheme, setInitialTheme] = useState({})
    const isPro = usePurchasedPro()

    useEffect(() => {
        initTheme()
            .catch((error) => console.debug('error loading app', error))
            .finally(() => setIsReady(true))
    }, [])

    const initTheme = async () => {
        const accent = await getItem(STORAGE_KEYS.ACCENT) || FREE_ACCENT
        const mode = await getItem(STORAGE_KEYS.THEME) || 'system'
        const name = mode !== 'system' ? mode : colorScheme
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
