import { PRO } from '@/constants/iap'

export const isProPurchase = (purchase) => (
    purchase.productId === PRO && purchase.purchaseState === 'purchased'
)

export const findProPurchase = (purchases) => purchases.find(isProPurchase)
