import { useCallback, useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Providers } from './providers'
import { useLanguage } from '@/hooks'
import { COLORS, SCOPES } from '@/constants'

export default function DrawerLayout() {
    const { initLanguage } = useLanguage()
    const [isReady, setIsReady] = useState(false)
    const [fontsLoaded, fontError] = useFonts({
        'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
        'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
        'AzeretMono-Light': require('../assets/fonts/AzeretMono-Light.ttf'),
        'AzeretMono-Medium': require('../assets/fonts/AzeretMono-Medium.ttf')
    })

    useEffect(() => {
        (async () => {
            await SplashScreen.preventAutoHideAsync()
            GoogleSignin.configure({ scopes: SCOPES })
            initLanguage()
            setIsReady(true)
        })()
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
            <Stack
                onLayout={onLayoutRootView}
                screenOptions={{
                    headerShown: false,

                    contentStyle: {
                        backgroundColor: COLORS.background
                    }
                }}
            >
                <Stack.Screen name='(stack)' />
                <Stack.Screen name='signin/index' />
            </Stack>
        </Providers>
    )
}
