import { useEffect, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { ActivityIndicator, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Section } from '@/components'
import { Option } from '@/screens'
import { useStorage } from '@/hooks'
import { ArrowForward, Check } from '@/icons'
import { ErrorCode, useIAP } from 'expo-iap'
import { PRO, PRODUCT_ID } from '@/constants/iap'
import { usePremium } from '@/hooks/use-premium'

export function PremiumSection() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const { premium, setPremium } = usePremium()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (connected) {
            fetchProducts({
                skus: PRODUCT_ID,
                type: 'in-app'
            })
        }
    }, [connected])

    const {
        connected,
        fetchProducts,
        requestPurchase,
        availablePurchases,
        getAvailablePurchases
    } = useIAP({
        onPurchaseSuccess: (purchase) => {
            console.log('Purchase successful:', purchase)
            onSuccessfulPurchase(purchase)
        },
        onPurchaseError: (error) => {
            console.log('Purchase failed:', error)
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

    const restorePurchases = async () => {
        try {
            setLoading(true)
            const purchased = false
            await getAvailablePurchases()

            let attempts = 0
            while (attempts < 20) {
                console.log('Checking for available purchases...', availablePurchases.length)
                if (availablePurchases.length > 0) {
                    break
                }

                await new Promise(resolve => setTimeout(resolve, 1000))
                attempts++
            }

            for (const purchase of availablePurchases) {
                if (purchase.productId === PRO) {
                    await setItem('premium', 'true')
                    setPremium(true)
                    purchased = true

                    ToastAndroid.show(
                        t('premium.messages.success'),
                        ToastAndroid.SHORT
                    )
                }
            }

            if (!purchased) {
                ToastAndroid.show(
                    t('premium.messages.purchased'),
                    ToastAndroid.SHORT
                )
            }
        } catch (error) {
            console.error('Failed to restore purchases:', error)
        } finally {
            setLoading(false)
        }
    }

    const onSuccessfulPurchase = async (purchase) => {
        console.log(purchase.transactionId)
        await setItem('premium', 'true')
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

    const iconProps = {
        color: colors.onBackground
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
                    loading ? <ActivityIndicator size='small' {...iconProps} />
                        : <ArrowForward {...iconProps} />
                }
                onPress={restorePurchases}
                isLast={true}
            />
        </Section>
    )
}
