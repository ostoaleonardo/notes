import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { useIAP } from 'expo-iap'
import { useLanguage, useStorage } from '@/hooks'
import { ThemeProvider } from '@/context'
import { STORAGE_KEYS, THEMES } from '@/constants'
import Providers from './providers'

import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { SCOPES } from '@/constants/google'
import { PRO } from '@/constants/iap'
import { PremiumProvider } from '@/hooks/use-premium'

GoogleSignin.configure({ scopes: SCOPES })

export default function MainLayout() {
    const colorScheme = useColorScheme()
    const { initLanguage } = useLanguage()
    const { setItem, getItem } = useStorage()

    const {
        connected,
        availablePurchases,
        getAvailablePurchases,
        finishTransaction
    } = useIAP()

    const [initialTheme, setInitialTheme] = useState({})
    const [isPremium, setIsPremium] = useState(false)

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
        if (connected) {
            getAvailablePurchases()
        }
    }, [connected])

    useEffect(() => {
        if (!availablePurchases?.length) return

        const restore = async () => {
            for (const product of availablePurchases) {
                if (product.productId === PRO && product.purchaseState === 'purchased') {
                    setIsPremium(true)
                    await setItem(STORAGE_KEYS.PRO, product.transactionId)
                    await finishTransaction({
                        purchase: product,
                        isConsumable: false
                    })
                }
            }
        }

        restore()
    }, [availablePurchases, finishTransaction])

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
