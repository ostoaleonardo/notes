import { getHeadingFontFamily, isHeadingFontKey, resolveHeadingFontKey } from '../heading-font'
import { DEFAULT_HEADING_FONT, HEADING_FONT_KEYS } from '@/constants/heading-fonts'
import { FONTS } from '@/constants/theme'

describe('validate a heading font key', () => {
    test('accepts the available fonts', () => {
        expect(isHeadingFontKey(HEADING_FONT_KEYS.GEIST)).toBe(true)
    })

    test('rejects unknown values', () => {
        expect(isHeadingFontKey('comic')).toBe(false)
    })

    test('rejects an empty stored value', () => {
        expect(isHeadingFontKey(null)).toBe(false)
    })
})

describe('resolve the heading font', () => {
    test('keeps a valid key', () => {
        expect(resolveHeadingFontKey(HEADING_FONT_KEYS.GEIST)).toBe(HEADING_FONT_KEYS.GEIST)
    })

    test('falls back to the default for an invalid key', () => {
        expect(resolveHeadingFontKey('comic')).toBe(DEFAULT_HEADING_FONT)
    })

    test('returns the font family of the selected key', () => {
        expect(getHeadingFontFamily(HEADING_FONT_KEYS.GEIST)).toBe(FONTS.geistMedium)
    })

    test('returns the default family when the key is invalid', () => {
        expect(getHeadingFontFamily('comic')).toBe(FONTS.nType82Headline)
    })
})
