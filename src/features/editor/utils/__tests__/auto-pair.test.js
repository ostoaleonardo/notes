import { getPairAction, isEmptyPair } from '../auto-pair'

describe('get pair action', () => {
    test('pairs a mark typed at the end of a line or before whitespace', () => {
        expect(getPairAction({ char: '*', before: 'a ', after: '' })).toBe('pair')
        expect(getPairAction({ char: '`', before: '', after: ' b' })).toBe('pair')
    })

    test('does not pair inside a word or before text', () => {
        expect(getPairAction({ char: '_', before: 'snake', after: '' })).toBeNull()
        expect(getPairAction({ char: '*', before: '2', after: '3' })).toBeNull()
        expect(getPairAction({ char: '*', before: '', after: 'text' })).toBeNull()
    })

    test('wraps the selection', () => {
        expect(getPairAction({ char: '=', before: '', after: '', selected: 'key' })).toBe('wrap')
    })

    test('expands an empty pair into a double mark', () => {
        expect(getPairAction({ char: '*', before: '*', after: '*' })).toBe('expand')
        expect(getPairAction({ char: '~', before: '~', after: '~' })).toBe('expand')
    })

    test('steps over the closing mark', () => {
        expect(getPairAction({ char: '*', before: '**a*', after: '*' })).toBe('skip')
        expect(getPairAction({ char: '*', before: '**', after: '**' })).toBe('skip')
        expect(getPairAction({ char: '_', before: '_a', after: '_' })).toBe('skip')
    })

    test('never expands backticks so fences can be typed', () => {
        expect(getPairAction({ char: '`', before: '`', after: '`' })).toBe('skip')
        expect(getPairAction({ char: '`', before: '``', after: '' })).toBeNull()
    })
})

describe('is empty pair', () => {
    test('detects a mark with the same mark right after the cursor', () => {
        expect(isEmptyPair({ char: '*', before: 'a *', after: '*' })).toBe(true)
        expect(isEmptyPair({ char: '*', before: 'a *', after: ' ' })).toBe(false)
    })
})
