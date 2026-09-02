import { diffLines } from '../diff-lines'

describe('diff lines', () => {
    test('marks every line as unchanged when the text is identical', () => {
        const result = diffLines('one\ntwo\nthree', 'one\ntwo\nthree')

        expect(result).toEqual([
            { type: 'unchanged', line: 'one' },
            { type: 'unchanged', line: 'two' },
            { type: 'unchanged', line: 'three' }
        ])
    })

    test('marks every line as added when the old text is empty', () => {
        const result = diffLines('', 'one\ntwo')

        expect(result).toEqual([
            { type: 'removed', line: '' },
            { type: 'added', line: 'one' },
            { type: 'added', line: 'two' }
        ])
    })

    test('marks every line as removed when the new text is empty', () => {
        const result = diffLines('one\ntwo', '')

        expect(result).toEqual([
            { type: 'removed', line: 'one' },
            { type: 'removed', line: 'two' },
            { type: 'added', line: '' }
        ])
    })

    test('detects a single line replaced in the middle', () => {
        const result = diffLines('one\ntwo\nthree', 'one\nreplaced\nthree')

        expect(result).toEqual([
            { type: 'unchanged', line: 'one' },
            { type: 'removed', line: 'two' },
            { type: 'added', line: 'replaced' },
            { type: 'unchanged', line: 'three' }
        ])
    })

    test('detects a line appended at the end', () => {
        const result = diffLines('one\ntwo', 'one\ntwo\nthree')

        expect(result).toEqual([
            { type: 'unchanged', line: 'one' },
            { type: 'unchanged', line: 'two' },
            { type: 'added', line: 'three' }
        ])
    })

    test('detects a line removed from the start', () => {
        const result = diffLines('one\ntwo\nthree', 'two\nthree')

        expect(result).toEqual([
            { type: 'removed', line: 'one' },
            { type: 'unchanged', line: 'two' },
            { type: 'unchanged', line: 'three' }
        ])
    })
})
