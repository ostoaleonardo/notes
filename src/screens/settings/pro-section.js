import { useEffect, useState } from 'react'
import { ErrorCode, finishTransaction, useIAP } from 'expo-iap'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, useTheme } from 'react-native-paper'

import { Option } from './option'
import { Section } from '@/components/section'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { usePro } from '@/hooks/use-pro'
import { useStorage } from '@/hooks/use-storage'
import { findProPurchase } from '@/utils/iap'

import { ArrowForward } from '@/icons/arrow-forward'
import { Check } from '@/icons/check'

import { PRODUCT_ID } from '@/constants/iap'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function ProSection() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const { pro, setPro } = usePro()
    const [loading, setLoading] = useState(false)

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
            isConsumable: false
        })

        setPro(true)
        showSnackbar(t('pro.messages.success'))
    }

    const onErrorPurchase = (error) => {
        switch (error.code) {
            case ErrorCode.UserCancelled:
                break
            case ErrorCode.ItemUnavailable:
                showSnackbar(t('pro.messages.available'))
                break
            case ErrorCode.ServiceError:
                showSnackbar(t('pro.messages.services'))
                break
            case ErrorCode.DeveloperError:
                showSnackbar(t('pro.messages.support'))
                break
            default:
                showSnackbar(error.message)
        }
    }

    const restorePurchases = async () => {
        try {
            setLoading(true)

            const proPurchase = findProPurchase(availablePurchases)

            if (proPurchase) {
                setPro(true)
                await setItem(STORAGE_KEYS.PRO, proPurchase.transactionId)
                showSnackbar(t('pro.messages.success'))
            } else {
                showSnackbar(t('pro.messages.no_purchased'))
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
            title={t('settings.pro')}
            containerStyle={{ paddingHorizontal: 16 }}
            contentStyle={{ gap: 3 }}
        >
            <Option
                title={t(pro ? 'pro.pro' : 'pro.get')}
                description={t(pro ? 'pro.success' : 'pro.features')}
                rightContent={
                    pro ? <Check color={colors.onBackground} />
                        : <ArrowForward color={colors.onBackground} />
                }
                onPress={pro ? null : purcharsePro}
                isFirst={true}
                isLast={pro}
            />
            <Option
                visible={!pro}
                title={t('pro.restore')}
                description={t('pro.purchased')}
                rightContent={
                    loading ? <ActivityIndicator size='small' color={colors.onBackground} />
                        : <ArrowForward color={colors.onBackground} />
                }
                onPress={restorePurchases}
                isLast={true}
            />
        </Section>
    )
}
