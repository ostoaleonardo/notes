import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { isDevice } from 'expo-device'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { finishTransaction, getAvailablePurchases, initConnection } from 'expo-iap'
import { useLanguage, useStorage } from '@/hooks'
import { ErrorBoundary } from '@/components'
import { PremiumProvider, ThemeProvider } from '@/context'
import { PRO, STORAGE_KEYS, THEMES } from '@/constants'
import Providers from './providers'

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary }

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { setItem, getItem } = useStorage()

    const [isReady, setIsReady] = useState(false)
    const [initialTheme, setInitialTheme] = useState({})
    const [isPremium, setIsPremium] = useState(false)

    useEffect(() => {
        try {
            initTheme()
            initPurchases()
        } catch (error) {
            console.debug('error loading app', error)
        } finally {
            setIsReady(true)
        }
    }, [])

    const initTheme = async () => {
        const accent = await getItem(STORAGE_KEYS.ACCENT) || 'red'
        const mode = await getItem(STORAGE_KEYS.THEME) || 'system'
        const name = mode !== 'system' ? mode : colorScheme
        const theme = THEMES[name]

        setInitialTheme({ mode, name, theme, accent })
        await initLanguage()
    }

    const initPurchases = () => {
        if (!isDevice) return

        initConnection().then(async () => {
            const purchases = await getAvailablePurchases()

            for (const purchase of purchases) {
                if (purchase.productId === PRO && purchase.purchaseState === 'purchased') {
                    setIsPremium(true)
                    await setItem(STORAGE_KEYS.PRO, purchase.transactionId)
                    await finishTransaction({
                        purchase: purchase,
                        isConsumable: false
                    })
                }
            }
        })
    }

    if (!isReady) {
        return null
    }

    return (
        <ThemeProvider initialTheme={initialTheme}>
            <PremiumProvider isPremium={isPremium}>
                <Providers>
                    <Slot />
                </Providers>
            </PremiumProvider>
        </ThemeProvider>
    )
}
