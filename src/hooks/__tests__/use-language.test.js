import { renderHook } from '@testing-library/react-native'
import { getLocales } from 'expo-localization'

import { useLanguage } from '../use-language'
import i18next from '@/i18n/i18next'
import { DEFAULT_LANGUAGE, SYSTEM_LANGUAGE } from '@/constants/languages'
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
    })

    test('does not store anything when initializing', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        getLocales.mockReturnValue([{ languageCode: 'de' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(mockStorage.setItem).not.toHaveBeenCalled()
    })

    test('follows the device language when nothing is stored', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        getLocales.mockReturnValue([{ languageCode: 'de' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith('de')
    })

    test('follows the device language when the system option is stored', async () => {
        mockStorage.getItem.mockResolvedValue(SYSTEM_LANGUAGE)
        getLocales.mockReturnValue([{ languageCode: 'es' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith('es')
    })

    test('falls back to the default language when the device language is unsupported', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        getLocales.mockReturnValue([{ languageCode: 'zz' }])
        const { result } = await setup()

        await result.current.initLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith(DEFAULT_LANGUAGE)
    })
})

describe('sync system language', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('updates the language when following the system', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        getLocales.mockReturnValue([{ languageCode: 'ja' }])
        const { result } = await setup()

        await result.current.syncSystemLanguage()

        expect(i18next.changeLanguage).toHaveBeenCalledWith('ja')
    })

    test('keeps an explicit language when the device language changes', async () => {
        mockStorage.getItem.mockResolvedValue('fr')
        getLocales.mockReturnValue([{ languageCode: 'ja' }])
        const { result } = await setup()

        await result.current.syncSystemLanguage()

        expect(i18next.changeLanguage).not.toHaveBeenCalled()
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

    test('stores the system option when it is selected', async () => {
        getLocales.mockReturnValue([{ languageCode: 'de' }])
        const { result } = await setup()

        result.current.changeLanguage(SYSTEM_LANGUAGE)

        expect(i18next.changeLanguage).toHaveBeenCalledWith('de')
        expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE, SYSTEM_LANGUAGE)
    })

    test('exposes the active language', async () => {
        const { result } = await setup()

        expect(result.current.currentLanguage).toBe('en')
    })
})
