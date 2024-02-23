import { useCallback, useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

export default function AppLayout() {
    const [fontsLoaded, fontError] = useFonts({
        'Roboto-Mono': require('../assets/fonts/RobotoMono.ttf'),
    })

    useEffect(() => {
        const loadFont = async () => {
            await SplashScreen.preventAutoHideAsync()
        }

        loadFont()
    }, [])

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || fontError) {
            await SplashScreen.hideAsync()
        }
    }, [fontsLoaded, fontError])

    if (!fontsLoaded && !fontError) {
        return null
    }

    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                headerTitleAlign: 'center',

                headerStyle: {
                    backgroundColor: '#18181b',
                },
            }}
            onLayout={onLayoutRootView}
        >
            <Stack.Screen
                name='index'
                options={{
                    headerTitle: 'NOTES',
                    headerTitleStyle: {
                        fontSize: 16,
                        color: 'white',
                        fontFamily: 'Roboto-Mono',
                    },
                }}
            />
        </Stack>
    )
}
