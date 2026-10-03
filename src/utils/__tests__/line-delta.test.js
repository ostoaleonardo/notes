import { applyLineDelta, buildLineDelta } from '../line-delta'

import { VERSION_DIFF_MAX_CELLS } from '@/constants/default-values'

const roundTrip = (from, to) => applyLineDelta(to, buildLineDelta(to, from))

describe('line delta', () => {
    test('is empty when both texts are equal', () => {
        expect(buildLineDelta('a\nb', 'a\nb')).toEqual([])
    })

    test('recovers the original text from the new one', () => {
        expect(roundTrip('a\nb\nc', 'a\nB\nc\nd')).toBe('a\nb\nc')
    })

    test('handles insertions at the start and deletions at the end', () => {
        expect(roundTrip('b\nc\nd', 'a\nb\nc')).toBe('b\nc\nd')
    })

    test('handles an empty text on either side', () => {
        expect(roundTrip('', 'a\nb')).toBe('')
        expect(roundTrip('a\nb', '')).toBe('a\nb')
    })

    test('stores only the changed lines', () => {
        const delta = buildLineDelta('a\nb\nc\nd', 'a\nB\nc\nd')

        expect(delta).toEqual([{ at: 1, remove: 1, insert: ['B'] }])
    })

    test('falls back to a single replace hunk for very large changes', () => {
        const size = Math.ceil(Math.sqrt(VERSION_DIFF_MAX_CELLS)) + 1
        const from = Array.from({ length: size }, (_, i) => `a${i}`).join('\n')
        const to = Array.from({ length: size }, (_, i) => `b${i}`).join('\n')

        expect(buildLineDelta(from, to)).toHaveLength(1)
        expect(roundTrip(from, to)).toBe(from)
    })
})
