import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { isDevice } from 'expo-device'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { finishTransaction, getAvailablePurchases, initConnection } from 'expo-iap'

import { ErrorBoundary } from '@/components/error-boundary'

import { useLanguage } from '@/hooks/use-language'
import { useStorage } from '@/hooks/use-storage'
import { PremiumProvider } from '@/context/premium-context'
import { ThemeProvider } from '@/context/theme-context'
import Providers from './providers'

import { PRO } from '@/constants/iap'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { THEMES } from '@/constants/themes'

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
