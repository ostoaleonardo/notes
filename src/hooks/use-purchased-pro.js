import { useCallback, useEffect, useRef, useState } from 'react'
import { isDevice } from 'expo-device'
import { finishTransaction, getAvailablePurchases, initConnection } from 'expo-iap'

import { useOnForeground } from './use-on-foreground'
import { useStorage } from './use-storage'
import { findProPurchase } from '@/utils/iap'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function usePurchasedPro() {
    const { setItem, removeItem } = useStorage()
    const [isPro, setIsPro] = useState(false)
    const connectedRef = useRef(false)

    const checkPurchases = useCallback(async () => {
        if (!isDevice) return

        try {
            if (!connectedRef.current) {
                await initConnection()
                connectedRef.current = true
            }

            const purchases = await getAvailablePurchases()
            const proPurchase = findProPurchase(purchases)

            if (proPurchase) {
                setIsPro(true)
                await setItem(STORAGE_KEYS.PRO, proPurchase.transactionId)

                if (!proPurchase.isAcknowledgedAndroid) {
                    await finishTransaction({ purchase: proPurchase, isConsumable: false })
                }
            } else {
                setIsPro(false)
                await removeItem(STORAGE_KEYS.PRO)
            }
        } catch (error) {
            connectedRef.current = false
            console.debug('error checking pro purchase', error)
        }
    }, [])

    useEffect(() => {
        checkPurchases()
    }, [checkPurchases])

    useOnForeground(checkPurchases)

    return isPro
}
