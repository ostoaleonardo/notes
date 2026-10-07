import { act, renderHook } from '@testing-library/react-native'
import { finishTransaction, getAvailablePurchases, initConnection } from 'expo-iap'

import { usePurchasedPro } from '../use-purchased-pro'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
}
let mockForegroundCallback = null
let mockIsDevice = true

jest.mock('expo-device', () => ({
    get isDevice() {
        return mockIsDevice
    }
}))
jest.mock('expo-iap', () => ({
    initConnection: jest.fn(),
    getAvailablePurchases: jest.fn(),
    finishTransaction: jest.fn()
}))
jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))
jest.mock('../use-on-foreground', () => ({
    useOnForeground: (callback) => {
        mockForegroundCallback = callback
    }
}))
jest.mock('@/utils/iap', () => ({
    findProPurchase: (purchases) => purchases.find((purchase) => purchase.isPro)
}))

const proPurchase = (extra = {}) => ({
    isPro: true,
    transactionId: 'tx-1',
    isAcknowledgedAndroid: true,
    ...extra
})

const setup = () => renderHook(() => usePurchasedPro())

describe('purchased pro', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
        mockIsDevice = true
        mockStorage.getItem.mockResolvedValue(null)
        mockStorage.setItem.mockResolvedValue()
        mockStorage.removeItem.mockResolvedValue()
        initConnection.mockResolvedValue()
        getAvailablePurchases.mockResolvedValue([])
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    test('is not pro without a stored or active purchase', async () => {
        const { result } = await setup()

        expect(result.current).toBe(false)
        expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.PRO)
    })

    test('is pro right away when a purchase was stored', async () => {
        mockStorage.getItem.mockResolvedValue('tx-old')
        getAvailablePurchases.mockReturnValue(new Promise(() => {}))

        const { result } = await setup()

        expect(result.current).toBe(true)
    })

    test('becomes pro and stores the transaction for an active purchase', async () => {
        getAvailablePurchases.mockResolvedValue([proPurchase()])

        const { result } = await setup()

        expect(result.current).toBe(true)
        expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.PRO, 'tx-1')
        expect(finishTransaction).not.toHaveBeenCalled()
    })

    test('acknowledges purchases that were not acknowledged yet', async () => {
        const purchase = proPurchase({ isAcknowledgedAndroid: false })
        getAvailablePurchases.mockResolvedValue([purchase])

        await setup()

        expect(finishTransaction).toHaveBeenCalledWith({ purchase, isConsumable: false })
    })

    test('revokes pro when the stored purchase is no longer available', async () => {
        mockStorage.getItem.mockResolvedValue('tx-old')

        const { result } = await setup()

        expect(result.current).toBe(false)
        expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.PRO)
    })

    test('skips store checks on emulators', async () => {
        mockIsDevice = false

        await setup()

        expect(initConnection).not.toHaveBeenCalled()
    })

    test('keeps the stored state and logs when the store check fails', async () => {
        mockStorage.getItem.mockResolvedValue('tx-old')
        initConnection.mockRejectedValue(new Error('offline'))

        const { result } = await setup()

        expect(result.current).toBe(true)
        expect(console.warn).toHaveBeenCalled()
    })

    test('reconnects after a failed connection', async () => {
        initConnection.mockRejectedValueOnce(new Error('offline'))
        const { result } = await setup()

        getAvailablePurchases.mockResolvedValue([proPurchase()])
        await act(async () => mockForegroundCallback())

        expect(initConnection).toHaveBeenCalledTimes(2)
        expect(result.current).toBe(true)
    })

    test('opens the store connection only once across checks', async () => {
        await setup()

        await act(async () => mockForegroundCallback())

        expect(initConnection).toHaveBeenCalledTimes(1)
        expect(getAvailablePurchases).toHaveBeenCalledTimes(2)
    })
})
