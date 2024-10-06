import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Providers } from './providers'
import { useLanguage, useStorage } from '@/hooks'
import { ThemeProvider } from '@/context'
import { STORAGE_KEYS, THEMES } from '@/constants'

SplashScreen.preventAutoHideAsync()

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { getItem } = useStorage()
    const [initialTheme, setInitialTheme] = useState({})
    const [loaded, error] = useFonts({
        'AzeretMono-Light': require('../assets/fonts/AzeretMono-Light.ttf'),
        'AzeretMono-Medium': require('../assets/fonts/AzeretMono-Medium.ttf'),
        'NType82-Headline': require('../assets/fonts/NType82-Headline.ttf')
    })

    useEffect(() => {
        (async () => {
            const mode = await getItem(STORAGE_KEYS.THEME) || 'system'
            const name = mode !== 'system' ? mode : colorScheme
            const theme = THEMES[name]
            setInitialTheme({ mode, name, theme })

            await initLanguage()
        })()
    }, [])

    useEffect(() => {
        if (loaded && initialTheme) {
            setTimeout(() => (
                SplashScreen.hideAsync()
            ), 500)
        }
    }, [loaded, initialTheme])

    if (!loaded && !error) {
        return null
    }

    return (
        <ThemeProvider initialTheme={initialTheme}>
            <Providers>
                <Slot />
            </Providers>
        </ThemeProvider>
    )
}
