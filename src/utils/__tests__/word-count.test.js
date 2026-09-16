import { countWords } from '../word-count'

describe('countWords', () => {
    test('counts words and characters for plain text', () => {
        expect(countWords('hello world')).toEqual({ words: 2, characters: 11 })
    })

    test('collapses repeated whitespace between words', () => {
        expect(countWords('hello   world\n\nfoo')).toEqual({ words: 3, characters: 18 })
    })

    test('returns zero words but keeps character count for whitespace-only text', () => {
        expect(countWords('   ')).toEqual({ words: 0, characters: 3 })
    })

    test('returns zeros for empty input', () => {
        expect(countWords('')).toEqual({ words: 0, characters: 0 })
        expect(countWords()).toEqual({ words: 0, characters: 0 })
    })
})
