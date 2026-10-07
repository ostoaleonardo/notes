import { getCodeRanges, isInsideRanges, mapOutsideCode } from '../outside-code'

describe('code ranges', () => {
    test('finds inline code ranges', () => {
        const text = 'a `b` c'

        expect(getCodeRanges(text)).toEqual([[2, 5]])
    })

    test('finds fenced code block ranges', () => {
        const text = 'x\n```\ncode\n```\ny'
        const [[from, to]] = getCodeRanges(text)

        expect(text.slice(from, to)).toBe('```\ncode\n```')
    })

    test('returns no ranges for plain text', () => {
        expect(getCodeRanges('plain text')).toEqual([])
    })
})

describe('inside ranges', () => {
    const ranges = [[2, 5], [10, 12]]

    test('includes the start of a range', () => {
        expect(isInsideRanges(ranges, 2)).toBe(true)
    })

    test('excludes the end of a range', () => {
        expect(isInsideRanges(ranges, 5)).toBe(false)
    })

    test('matches any of the ranges', () => {
        expect(isInsideRanges(ranges, 11)).toBe(true)
    })

    test('is false with no ranges', () => {
        expect(isInsideRanges([], 3)).toBe(false)
    })
})

describe('map outside code', () => {
    test('transforms only text outside code', () => {
        const result = mapOutsideCode('a `b` c', (text) => text.toUpperCase())

        expect(result).toBe('A `b` C')
    })
})
