import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Providers } from './providers'
import { useLanguage, useStorage } from '@/hooks'
import { STORAGE_KEYS } from '@/constants'

SplashScreen.preventAutoHideAsync()

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { getItem } = useStorage()
    const [initialTheme, setInitialTheme] = useState({})
    const [isReady, setIsReady] = useState(false)
    const [fontsLoaded, fontError] = useFonts({
        'AzeretMono-Light': require('../assets/fonts/AzeretMono-Light.ttf'),
        'AzeretMono-Medium': require('../assets/fonts/AzeretMono-Medium.ttf')
    })

    useEffect(() => {
        (async () => {
            const mode = await getItem(STORAGE_KEYS.THEME) || 'system'
            const name = themeMode !== 'system' ? themeMode : colorScheme
            setInitialTheme({ mode, name })

            await initLanguage()
            setIsReady(true)
        })()
    }, [])

    useEffect(() => {
        if (isReady && initialTheme) {
            SplashScreen.hideAsync()
        }
    }, [isReady])

    if (!fontsLoaded && !fontError) {
        return null
    }

    return (
        <Providers initialTheme={initialTheme}>
            <Slot />
        </Providers>
    )
}
