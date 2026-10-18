import { contrastRatio, getReadableAccent, mixColors } from '../accent-contrast'
import { ACCENT_TEXT_CONTRAST } from '@/constants/accent-contrast'

const DARK = { surfaces: ['#06080a', '#121318', '#1e2124'], toward: '#f0f2f1' }
const LIGHT = { surfaces: ['#d7d8d8', '#e7e9e9'], toward: '#06080a' }

const worst = (color, accent, surfaces) => Math.min(
    ...surfaces.flatMap((surface) => [
        contrastRatio(color, surface),
        contrastRatio(color, mixColors(accent, surface, ACCENT_TEXT_CONTRAST.tint))
    ])
)

describe('contrast ratio', () => {
    test('is 21 between black and white', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    })

    test('is 1 for the same color', () => {
        expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5)
    })
})

describe('mix colors', () => {
    test('returns the foreground at full amount', () => {
        expect(mixColors('#ff0000', '#0000ff', 1)).toBe('#ff0000')
    })

    test('returns the background at zero amount', () => {
        expect(mixColors('#ff0000', '#0000ff', 0)).toBe('#0000ff')
    })

    test('averages both colors at half', () => {
        expect(mixColors('#000000', '#ffffff', 0.5)).toBe('#808080')
    })
})

describe('readable accent', () => {
    test('keeps an accent that already reads well', () => {
        const result = getReadableAccent({ accent: '#ffc700', ...DARK })

        expect(result).toBe('#ffc700')
    })

    test('lightens a dark accent on a dark theme', () => {
        const result = getReadableAccent({ accent: '#002f6c', ...DARK })

        expect(contrastRatio(result, '#06080a')).toBeGreaterThanOrEqual(ACCENT_TEXT_CONTRAST.target)
    })

    test('darkens a light accent on a light theme', () => {
        const result = getReadableAccent({ accent: '#ffc700', ...LIGHT })

        expect(contrastRatio(result, '#d7d8d8')).toBeGreaterThanOrEqual(ACCENT_TEXT_CONTRAST.target)
    })

    test.each(['#f0f2f1', '#c8102e', '#ffc700', '#002f6c'])(
        'reaches the target on every dark surface for %s',
        (accent) => {
            const result = getReadableAccent({ accent, ...DARK })

            expect(worst(result, accent, DARK.surfaces)).toBeGreaterThanOrEqual(ACCENT_TEXT_CONTRAST.target)
        }
    )

    test.each(['#f0f2f1', '#c8102e', '#ffc700', '#002f6c'])(
        'reaches the target on every light surface for %s',
        (accent) => {
            const result = getReadableAccent({ accent, ...LIGHT })

            expect(worst(result, accent, LIGHT.surfaces)).toBeGreaterThanOrEqual(ACCENT_TEXT_CONTRAST.target)
        }
    )
})
