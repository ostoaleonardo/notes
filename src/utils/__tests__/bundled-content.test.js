import { getBundledTemplates, getBundledWelcome, setBundledContent } from '../bundled-content'

let mockLanguage = 'en'

jest.mock('@/i18n/i18next', () => ({
    __esModule: true,
    default: {
        get language() {
            return mockLanguage
        }
    }
}))

beforeEach(() => {
    mockLanguage = 'en'
    setBundledContent({
        welcome: { en: 'English welcome', es: 'Bienvenida' },
        templates: { en: { journal: 'Journal' }, es: { journal: 'Diario' } }
    })
})

describe('bundled content language', () => {
    test('returns the content of the current language', () => {
        mockLanguage = 'es'

        expect(getBundledWelcome()).toBe('Bienvenida')
        expect(getBundledTemplates().journal).toBe('Diario')
    })

    test('ignores the region of the language code', () => {
        mockLanguage = 'es-MX'

        expect(getBundledWelcome()).toBe('Bienvenida')
    })

    test('falls back to english for a language without content', () => {
        mockLanguage = 'fr'

        expect(getBundledWelcome()).toBe('English welcome')
        expect(getBundledTemplates().journal).toBe('Journal')
    })

    test('returns nothing before the content is loaded', () => {
        setBundledContent({ welcome: {}, templates: {} })

        expect(getBundledWelcome()).toBeUndefined()
        expect(getBundledTemplates()).toEqual({})
    })
})
