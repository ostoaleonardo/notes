import { PRO, PURCHASE_STATES } from '@/constants/iap'

export const isProPurchase = (purchase) => (
    purchase.productId === PRO && purchase.purchaseState === PURCHASE_STATES.PURCHASED
)

export const findProPurchase = (purchases) => purchases.find(isProPurchase)
