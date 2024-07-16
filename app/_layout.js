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
    const [userTheme, setUserTheme] = useState('')
    const [isReady, setIsReady] = useState(false)
    const [fontsLoaded, fontError] = useFonts({
        'AzeretMono-Light': require('../assets/fonts/AzeretMono-Light.ttf'),
        'AzeretMono-Medium': require('../assets/fonts/AzeretMono-Medium.ttf')
    })

    useEffect(() => {
        (async () => {
            const userTheme = await getItem(STORAGE_KEYS.THEME)
            const theme = userTheme && userTheme !== 'system' ? userTheme : colorScheme
            setUserTheme(theme)

            await initLanguage()
            setIsReady(true)
        })()
    }, [])

    useEffect(() => {
        if (isReady && userTheme) {
            SplashScreen.hideAsync()
        }
    }, [isReady])

    if (!fontsLoaded && !fontError) {
        return null
    }

    return (
        <Providers userTheme={userTheme}>
            <Slot />
        </Providers>
    )
}
