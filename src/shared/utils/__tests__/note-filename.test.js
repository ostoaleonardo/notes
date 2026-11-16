import {
    getUniqueFilename,
    getUniqueTitle,
    hasLinkBreakingChars,
    isTitleTaken,
    sanitizeFilename
} from '../note-filename'

describe('sanitize filename', () => {
    test('strips characters illegal in filenames', () => {
        expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe('a b c d e f g h i j')
    })

    test('falls back to Untitled for empty input', () => {
        expect(sanitizeFilename('')).toBe('Untitled')
        expect(sanitizeFilename('   ')).toBe('Untitled')
    })

    test('truncates titles longer than 200 characters', () => {
        const long = 'a'.repeat(250)
        expect(sanitizeFilename(long)).toHaveLength(200)
    })
})

describe('get unique title', () => {
    test('returns the base title when it is not taken', () => {
        expect(getUniqueTitle(['Other'], 'Note')).toBe('Note')
    })

    test('appends an incrementing suffix until the title is free', () => {
        expect(getUniqueTitle(['Note', 'Note (2)'], 'Note')).toBe('Note (3)')
    })
})

describe('get unique filename', () => {
    test('appends .md to a free title', () => {
        expect(getUniqueFilename([], 'Groceries', null)).toBe('Groceries.md')
    })

    test('disambiguates against existing files', () => {
        const existing = ['Groceries.md', 'Groceries (2).md']
        expect(getUniqueFilename(existing, 'Groceries', null)).toBe('Groceries (3).md')
    })

    test('ignores the current filename when renaming in place', () => {
        const existing = ['Groceries.md']
        expect(getUniqueFilename(existing, 'Groceries', 'Groceries.md')).toBe('Groceries.md')
    })

    test('uses a custom extension when provided', () => {
        const existing = ['Groceries.md']
        expect(getUniqueFilename(existing, 'Groceries', null, '.html')).toBe('Groceries.html')
    })
})

describe('is title taken', () => {
    test('returns true when another file already has that title', () => {
        const existing = ['Groceries.md', 'Chores.md']
        expect(isTitleTaken(existing, 'Chores', 'Groceries.md')).toBe(true)
    })

    test('returns false when the only match is the file being renamed', () => {
        const existing = ['Groceries.md']
        expect(isTitleTaken(existing, 'Groceries', 'Groceries.md')).toBe(false)
    })

    test('returns false when no file has that title', () => {
        const existing = ['Groceries.md']
        expect(isTitleTaken(existing, 'Chores', 'Groceries.md')).toBe(false)
    })
})

describe('has link breaking chars', () => {
    test.each(['C# notes', 'a ^ b', 'a [b', 'a ]b'])('flags %s', (title) => {
        expect(hasLinkBreakingChars(title)).toBe(true)
    })

    test('accepts a plain title', () => {
        expect(hasLinkBreakingChars('Groceries (2)')).toBe(false)
    })

    test('accepts an empty title', () => {
        expect(hasLinkBreakingChars('')).toBe(false)
    })
})
