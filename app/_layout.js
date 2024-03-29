import { useCallback, useEffect, useState } from 'react'
import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Providers } from './providers'
import { useLanguage } from '@/hooks'

export default function DrawerLayout() {
    const { initLanguage } = useLanguage()
    const [isReady, setIsReady] = useState(false)
    const [fontsLoaded, fontError] = useFonts({
        'Roboto-Mono': require('../assets/fonts/RobotoMono.ttf'),
    })

    useEffect(() => {
        const prepare = async () => {
            await SplashScreen.preventAutoHideAsync()
            initLanguage()
            setIsReady(true)
        }

        prepare()
    }, [])

    const onLayoutRootView = useCallback(async () => {
        if (isReady) {
            await SplashScreen.hideAsync()
        }
    }, [isReady])

    if (!fontsLoaded && !fontError) {
        return null
    }

    return (
        <Providers>
            <Slot onLayout={onLayoutRootView} />
        </Providers>
    )
}
