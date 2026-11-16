import AsyncStorage from '@react-native-async-storage/async-storage'

import { storage } from '../storage'

jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        setItem: jest.fn(async () => 'ignored'),
        getItem: jest.fn(async () => 'value'),
        removeItem: jest.fn(async () => 'ignored'),
        getAllKeys: jest.fn(async () => ['a', 'b']),
        multiGet: jest.fn(async () => [['a', '1']]),
        multiSet: jest.fn(async () => 'ignored')
    }
}))

describe('storage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('writes an item', async () => {
        await storage.setItem('key', 'value')

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('key', 'value')
    })

    test('reads an item', async () => {
        expect(await storage.getItem('key')).toBe('value')
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('key')
    })

    test('removes an item', async () => {
        await storage.removeItem('key')

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('key')
    })

    test('lists all keys', async () => {
        expect(await storage.getAllKeys()).toEqual(['a', 'b'])
    })

    test('reads and writes several items', async () => {
        expect(await storage.multiGet(['a'])).toEqual([['a', '1']])

        await storage.multiSet([['a', '2']])

        expect(AsyncStorage.multiSet).toHaveBeenCalledWith([['a', '2']])
    })

    test('does not leak the underlying write result', async () => {
        expect(await storage.setItem('key', 'value')).toBeUndefined()
        expect(await storage.removeItem('key')).toBeUndefined()
        expect(await storage.multiSet([])).toBeUndefined()
    })
})
