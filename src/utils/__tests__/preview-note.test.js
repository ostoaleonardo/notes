import { getPreviewNote } from '../preview-note'

describe('get preview note', () => {
    test('returns an empty string for empty input', () => {
        expect(getPreviewNote('')).toBe('')
    })

    test('returns plain text untouched', () => {
        expect(getPreviewNote('Buy milk and eggs')).toBe('Buy milk and eggs')
    })

    test('keeps markdown links intact', () => {
        const note = 'See [docs](https://example.com) for details'

        expect(getPreviewNote(note)).toBe(note)
    })

    test('keeps markdown images intact', () => {
        const note = '![diagram](https://example.com/a.png)'

        expect(getPreviewNote(note)).toBe(note)
    })

    test('limits the preview to the given number of lines', () => {
        const note = ['one', 'two', 'three'].join('\n')
        expect(getPreviewNote(note, 2)).toBe('one\ntwo')
    })

    test('truncates text longer than the given character limit', () => {
        const note = 'a'.repeat(20)
        const preview = getPreviewNote(note, 5, 10)
        expect(preview).toBe(`${'a'.repeat(10)}...`)
    })
})
