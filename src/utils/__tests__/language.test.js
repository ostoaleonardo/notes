import { getSystemLanguage, isSupportedLanguage, resolveLanguage } from '../language'

import { DEFAULT_LANGUAGE, SYSTEM_LANGUAGE } from '@/constants/languages'

describe('system language', () => {
    test('uses the first device locale when it is supported', () => {
        expect(getSystemLanguage([{ languageCode: 'de' }, { languageCode: 'fr' }])).toBe('de')
    })

    test('falls back to the default language when the device locale is unsupported', () => {
        expect(getSystemLanguage([{ languageCode: 'zz' }])).toBe(DEFAULT_LANGUAGE)
    })

    test('falls back to the default language without locales', () => {
        expect(getSystemLanguage([])).toBe(DEFAULT_LANGUAGE)
        expect(getSystemLanguage(undefined)).toBe(DEFAULT_LANGUAGE)
    })
})

describe('resolve language', () => {
    test('keeps an explicit supported language', () => {
        expect(resolveLanguage('fr', 'de')).toBe('fr')
    })

    test('follows the system language when the selection is the system option', () => {
        expect(resolveLanguage(SYSTEM_LANGUAGE, 'de')).toBe('de')
    })

    test('follows the system language when nothing is stored', () => {
        expect(resolveLanguage(null, 'de')).toBe('de')
        expect(resolveLanguage(undefined, 'de')).toBe('de')
    })

    test('follows the system language when the stored value is unknown', () => {
        expect(resolveLanguage('zz', 'de')).toBe('de')
    })
})

describe('supported language', () => {
    test('rejects the system option', () => {
        expect(isSupportedLanguage(SYSTEM_LANGUAGE)).toBe(false)
    })
})
