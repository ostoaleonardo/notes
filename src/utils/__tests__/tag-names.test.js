import { dedupeTags, hasTag, isSameTag, isValidTagName, matchesTag, sanitizeTagName } from '../tag-names'

describe('tag names', () => {
    test('compares tags ignoring case', () => {
        expect(isSameTag('Work', 'work')).toBe(true)
        expect(isSameTag('work', 'home')).toBe(false)
    })

    test('finds a tag regardless of its casing', () => {
        expect(hasTag(['Work', 'Home'], 'HOME')).toBe(true)
        expect(hasTag(['Work'], 'home')).toBe(false)
    })

    test('keeps the first casing when removing duplicates', () => {
        expect(dedupeTags(['Work', 'work', 'Home', 'HOME'])).toEqual(['Work', 'Home'])
    })
})

describe('match tag', () => {
    test('matches the same tag ignoring case', () => {
        expect(matchesTag('Work', 'work')).toBe(true)
    })

    test('matches nested tags under the queried parent', () => {
        expect(matchesTag('work/projects/a', 'work')).toBe(true)
        expect(matchesTag('work/projects/a', 'work/projects')).toBe(true)
    })

    test('does not match a tag that only shares a prefix', () => {
        expect(matchesTag('workshop', 'work')).toBe(false)
    })

    test('does not match a parent when querying a child', () => {
        expect(matchesTag('work', 'work/projects')).toBe(false)
    })
})

describe('sanitize tag name', () => {
    test('removes leading hashes and trims spaces', () => {
        expect(sanitizeTagName('  ##work ')).toBe('work')
    })

    test('joins words with hyphens', () => {
        expect(sanitizeTagName('my  big tag')).toBe('my-big-tag')
    })

    test('removes punctuation but keeps slashes, hyphens and underscores', () => {
        expect(sanitizeTagName('a/b_c-d!?.')).toBe('a/b_c-d')
    })

    test('drops trailing slashes', () => {
        expect(sanitizeTagName('work//')).toBe('work')
    })
})

describe('valid tag name', () => {
    test('requires at least one non numeric character', () => {
        expect(isValidTagName('work')).toBe(true)
        expect(isValidTagName('2024a')).toBe(true)
        expect(isValidTagName('2024')).toBe(false)
        expect(isValidTagName('')).toBe(false)
    })
})
