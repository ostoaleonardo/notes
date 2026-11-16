import { countWords } from '../word-count'

describe('count words', () => {
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

    test('ignores leading and trailing whitespace', () => {
        expect(countWords('  \n hello world \t ')).toEqual({ words: 2, characters: 18 })
    })

    test('treats unicode spaces as separators', () => {
        expect(countWords('one\u00a0two\u2003three\u3000four')).toEqual({ words: 4, characters: 18 })
    })

    test('counts non-ascii words', () => {
        expect(countWords('canción año 日本語')).toEqual({ words: 3, characters: 15 })
    })

    test('matches the whitespace split on a long text', () => {
        const text = Array.from({ length: 5000 }, (_, index) => `word${index}${index % 7 ? ' ' : '\n\n'}`).join('')
        const expected = text.trim().split(/\s+/).length

        expect(countWords(text).words).toBe(expected)
    })
})
