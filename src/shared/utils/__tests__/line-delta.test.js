import { applyLineDelta } from '../line-delta'

describe('apply line delta', () => {
    test('returns the text untouched for an empty delta', () => {
        expect(applyLineDelta('a\nb', [])).toBe('a\nb')
    })

    test('replaces the lines of a hunk', () => {
        expect(applyLineDelta('a\nb\nc\nd', [{ at: 1, remove: 1, insert: ['B'] }])).toBe('a\nB\nc\nd')
    })

    test('inserts at the start and removes at the end', () => {
        const delta = [{ at: 0, remove: 0, insert: ['a'] }, { at: 2, remove: 1, insert: [] }]

        expect(applyLineDelta('b\nc\nd', delta)).toBe('a\nb\nc')
    })

    test('handles an empty text on either side', () => {
        expect(applyLineDelta('', [{ at: 0, remove: 1, insert: ['a', 'b'] }])).toBe('a\nb')
        expect(applyLineDelta('a\nb', [{ at: 0, remove: 2, insert: [''] }])).toBe('')
    })
})
