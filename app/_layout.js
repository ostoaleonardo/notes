import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { useIAP } from 'expo-iap'
import { useLanguage, useStorage } from '@/hooks'
import { ThemeProvider } from '@/context'
import { STORAGE_KEYS, THEMES } from '@/constants'
import Providers from './providers'

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { connected, getAvailablePurchases } = useIAP()
    const { getItem } = useStorage()

    const [initialTheme, setInitialTheme] = useState({})

    useEffect(() => {
        (async () => {
            const accent = await getItem(STORAGE_KEYS.ACCENT) || 'red'
            const mode = await getItem(STORAGE_KEYS.THEME) || 'system'
            const name = mode !== 'system' ? mode : colorScheme
            const theme = THEMES[name]

            setInitialTheme({ mode, name, theme, accent })
            await initLanguage()
        })()
    }, [])

    useEffect(() => {
        const getAvailableProducts = async () => {
            if (connected) {
                console.log('Fetching products...')
                // await getAvailablePurchases()
            }
        }

        getAvailableProducts()
    }, [connected])

    return (
        <ThemeProvider initialTheme={initialTheme}>
            <Providers>
                <Slot />
            </Providers>
        </ThemeProvider>
    )
}
