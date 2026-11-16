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

    test('reinserts each image correctly when alt text is empty or duplicated', () => {
        const note = '![](https://example.com/a.png) and ![](https://example.com/b.png)'

        expect(getPreviewNote(note)).toBe(note)
    })

    test('reinserts each link correctly when link text is duplicated', () => {
        const note = '[here](https://example.com/a) and [here](https://example.com/b)'

        expect(getPreviewNote(note)).toBe(note)
    })
})
