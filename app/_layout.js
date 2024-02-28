import { useCallback, useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { Menu, Settings } from '../src/icons'
import { IconButton } from '../src/components'
import { Providers } from './providers'
import { colors, fonts } from '../src/constants'

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
        <Providers>
            <Stack
                screenOptions={{
                    headerShadowVisible: false,
                    headerTitleAlign: 'center',
                    headerTintColor: colors.text,

                    headerStyle: {
                        backgroundColor: colors.background,
                    },

                    headerTitleStyle: {
                        fontSize: 16,
                        color: colors.text,
                        fontFamily: fonts.mono,
                    },
                }}
                onLayout={onLayoutRootView}
            >
                <Stack.Screen
                    name='index'
                    options={{
                        headerTitle: 'NOTES',
                        headerLeft: () => (
                            <IconButton
                                onPress={() => { }}
                                icon={<Menu width={24} height={24} color={colors.text} />}
                            />
                        ),
                        headerRight: () => (
                            <IconButton
                                onPress={() => { }}
                                icon={<Settings width={24} height={24} color={colors.text} />}
                            />
                        ),
                    }}
                />
                <Stack.Screen
                    name='note/index'
                    options={{
                        headerTitle: 'ADD NOTE',
                    }}
                />
                <Stack.Screen
                    name='note/[slug]'
                    options={{
                        headerTitle: 'EDIT NOTE',
                    }}
                />
            </Stack >
        </Providers >
    )
}
