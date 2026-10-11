import { renderHook } from '@testing-library/react-native'
import { getLocales } from 'expo-localization'

import { useLanguage } from '../use-language'
import i18next from '@/i18n/i18next'
import { DEFAULT_LANGUAGE } from '@/constants/languages'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))

jest.mock('expo-localization', () => ({
    getLocales: jest.fn()
}))

jest.mock('@/i18n/i18next', () => ({
    language: 'en',
    changeLanguage: jest.fn()
}))

const setup = () => renderHook(() => useLanguage())

describe('init language', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('uses the stored language first', async () => {
        mockStorage.getItem.mockResolvedValue('fr')
        getLocales.mockReturnValue([{ languageCode: 'de' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith('fr')
        expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE, 'fr')
    })

    test('falls back to the device language when it is supported', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        getLocales.mockReturnValue([{ languageCode: 'de' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith('de')
    })

    test('falls back to the default language when the device language is unsupported', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        getLocales.mockReturnValue([{ languageCode: 'zz' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith(DEFAULT_LANGUAGE)
    })
})

describe('change language', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('switches the language and persists it', async () => {
        const { result } = await setup()

        result.current.changeLanguage('ja')

        expect(i18next.changeLanguage).toHaveBeenCalledWith('ja')
        expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE, 'ja')
    })

    test('exposes the active language', async () => {
        const { result } = await setup()

        expect(result.current.currentLanguage).toBe('en')
    })
})
