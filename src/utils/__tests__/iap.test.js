import { findProPurchase, isProPurchase } from '../iap'
import { PRO } from '@/constants/iap'

describe('isProPurchase', () => {
    test('returns true for a purchased pro entitlement', () => {
        expect(isProPurchase({ productId: PRO, purchaseState: 'purchased' })).toBe(true)
    })

    test('returns false for a different product', () => {
        expect(isProPurchase({ productId: 'other.sku', purchaseState: 'purchased' })).toBe(false)
    })

    test('returns false for a refunded or voided purchase', () => {
        expect(isProPurchase({ productId: PRO, purchaseState: 'refunded' })).toBe(false)
    })

    test('returns false for a pending purchase', () => {
        expect(isProPurchase({ productId: PRO, purchaseState: 'pending' })).toBe(false)
    })
})

describe('findProPurchase', () => {
    test('returns the matching purchase when present', () => {
        const purchase = { productId: PRO, purchaseState: 'purchased', transactionId: 'tx-1' }
        expect(findProPurchase([purchase])).toBe(purchase)
    })

    test('ignores unrelated and non-purchased entries', () => {
        const purchases = [
            { productId: 'other.sku', purchaseState: 'purchased' },
            { productId: PRO, purchaseState: 'refunded' }
        ]

        expect(findProPurchase(purchases)).toBeUndefined()
    })

    test('returns undefined for an empty list', () => {
        expect(findProPurchase([])).toBeUndefined()
    })

    test('finds the pro purchase among several entries', () => {
        const proPurchase = { productId: PRO, purchaseState: 'purchased', transactionId: 'tx-2' }
        const purchases = [
            { productId: 'other.sku', purchaseState: 'purchased' },
            proPurchase
        ]

        expect(findProPurchase(purchases)).toBe(proPurchase)
    })
})
