import { useEffect, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { ErrorCode, useIAP } from 'expo-iap'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native-paper'

import { Option } from './option'
import { Section } from '@/components/section'

import { useIconProps } from '@/hooks/use-icon-props'
import { usePremium } from '@/hooks/use-premium'
import { useStorage } from '@/hooks/use-storage'

import { ArrowForward } from '@/icons/arrow-forward'
import { Check } from '@/icons/check'

import { PRO, PRODUCT_ID } from '@/constants/iap'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function PremiumSection() {
    const { t } = useTranslation()
    const iconProps = useIconProps()
    const { setItem } = useStorage()
    const { premium, setPremium } = usePremium()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getPurchases = async () => {
            if (connected) {
                fetchProducts({
                    skus: PRODUCT_ID,
                    type: 'in-app'
                })

                await getAvailablePurchases()
            }
        }

        getPurchases()
    }, [connected])

    const {
        connected,
        fetchProducts,
        requestPurchase,
        availablePurchases,
        getAvailablePurchases
    } = useIAP({
        onPurchaseSuccess: (purchase) => {
            console.debug('Purchase successful:', purchase.transactionId)
            onSuccessfulPurchase(purchase)
        },
        onPurchaseError: (error) => {
            console.debug('Purchase failed:', error)
            onErrorPurchase(error)
        }
    })

    const purcharsePro = async () => {
        await requestPurchase({
            request: {
                google: { skus: PRODUCT_ID }
            }
        })
    }

    const onSuccessfulPurchase = async (purchase) => {
        await setItem(
            STORAGE_KEYS.PRO,
            purchase.transactionId
        )

        await finishTransaction({
            purchase,
            isConsumable: true
        })

        setPremium(true)
        ToastAndroid.show(
            t('premium.messages.success'),
            ToastAndroid.SHORT
        )
    }

    const onErrorPurchase = (error) => {
        switch (error.code) {
            case ErrorCode.UserCancelled:
                break
            case ErrorCode.ItemUnavailable:
                ToastAndroid.show(
                    t('premium.messages.available'),
                    ToastAndroid.SHORT
                )
                break
            case ErrorCode.ServiceError:
                ToastAndroid.show(
                    t('premium.messages.services'),
                    ToastAndroid.SHORT
                )
                break
            case ErrorCode.DeveloperError:
                ToastAndroid.show(
                    t('premium.messages.support'),
                    ToastAndroid.SHORT
                )
                break
            default:
                ToastAndroid.show(
                    error.message,
                    ToastAndroid.SHORT
                )
        }
    }

    const restorePurchases = async () => {
        try {
            setLoading(true)
            const purchased = false

            for (const purchase of availablePurchases) {
                if (purchase.productId === PRO && purchase.purchaseState === 'purchased') {
                    setPremium(true)
                    purchased = true

                    await setItem(
                        STORAGE_KEYS.PRO,
                        purchase.transactionId
                    )

                    ToastAndroid.show(
                        t('premium.messages.success'),
                        ToastAndroid.SHORT
                    )
                }
            }

            if (!purchased) {
                ToastAndroid.show(
                    t('premium.messages.no.purchased'),
                    ToastAndroid.SHORT
                )
            }
        } catch (error) {
            console.error('Failed to restore purchases:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!connected) return null

    return (
        <Section
            title={t('settings.premium')}
            containerStyle={{ paddingHorizontal: 16 }}
            contentStyle={{ gap: 3 }}
        >
            <Option
                title={t(premium ? 'premium.pro' : 'premium.get')}
                description={t(premium ? 'premium.success' : 'premium.features')}
                rightContent={
                    premium ? <Check {...iconProps} />
                        : <ArrowForward {...iconProps} />
                }
                onPress={premium ? null : purcharsePro}
                isFirst={true}
                isLast={premium}
            />
            <Option
                visible={!premium}
                title={t('premium.restore')}
                description={t('premium.purchased')}
                rightContent={
                    loading ? <ActivityIndicator size='small' color={iconProps.color} />
                        : <ArrowForward {...iconProps} />
                }
                onPress={restorePurchases}
                isLast={true}
            />
        </Section>
    )
}
