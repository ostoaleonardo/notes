import {
    buildNoteFileContent,
    decomposeNoteFileContent,
    extractProperties,
    normalizeTags,
    parseFrontmatter
} from '../frontmatter'

describe('parseFrontmatter', () => {
    test('extracts tags and dates from a leading frontmatter block', () => {
        const content = '---\ntags:\n  - one\n  - two\ncreatedAt: 100\nupdatedAt: 200\n---\n\nHello world'

        const { frontmatter, body, error, hasBlock } = parseFrontmatter(content)

        expect(frontmatter).toEqual({ tags: ['one', 'two'], createdAt: 100, updatedAt: 200 })
        expect(body).toBe('Hello world')
        expect(error).toBe(false)
        expect(hasBlock).toBe(true)
    })

    test('accepts tags written as an inline flow list', () => {
        const content = '---\ntags: [one, two]\n---\n\nHello world'

        const { frontmatter, error } = parseFrontmatter(content)

        expect(frontmatter.tags).toEqual(['one', 'two'])
        expect(error).toBe(false)
    })

    test('returns the content unchanged when there is no frontmatter block', () => {
        const content = 'Just a note with no frontmatter'

        const { frontmatter, body, error, hasBlock } = parseFrontmatter(content)

        expect(frontmatter).toEqual({})
        expect(body).toBe(content)
        expect(error).toBe(false)
        expect(hasBlock).toBe(false)
    })

    test('strips an empty frontmatter block', () => {
        const content = '---\n\n---\n\nBody text'

        const { frontmatter, body, error, hasBlock } = parseFrontmatter(content)

        expect(frontmatter).toEqual({})
        expect(body).toBe('Body text')
        expect(error).toBe(false)
        expect(hasBlock).toBe(true)
    })

    test('treats two adjacent dash fences with no blank line as having no frontmatter block', () => {
        const content = '---\n---\n\nBody text'

        const { frontmatter, body, error, hasBlock } = parseFrontmatter(content)

        expect(frontmatter).toEqual({})
        expect(body).toBe(content)
        expect(error).toBe(false)
        expect(hasBlock).toBe(false)
    })

    test('treats a leading horizontal rule followed by prose as an invalid block', () => {
        const content = '---\njust some prose\nmore text\n---\n\nRest of the note'

        const { frontmatter, body, error, hasBlock } = parseFrontmatter(content)

        expect(frontmatter).toEqual({})
        expect(body).toBe('Rest of the note')
        expect(error).toBe(true)
        expect(hasBlock).toBe(true)
    })

    test('flags invalid yaml in the frontmatter block as an error and preserves the raw text', () => {
        const content = '---\ntags: [unterminated\n---\n\nBody text'

        const { frontmatter, body, error, hasBlock, rawFrontmatter } = parseFrontmatter(content)

        expect(frontmatter).toEqual({})
        expect(body).toBe('Body text')
        expect(error).toBe(true)
        expect(hasBlock).toBe(true)
        expect(rawFrontmatter).toBe('tags: [unterminated')
    })

    test('flags a frontmatter block that does not resolve to an object as an error', () => {
        const content = '---\njust a plain string\n---\n\nBody text'

        const { error } = parseFrontmatter(content)

        expect(error).toBe(true)
    })
})

describe('buildNoteFileContent', () => {
    test('serializes tags as a yaml block list', () => {
        const content = buildNoteFileContent({ tags: ['personal', 'work'] }, 'Body')

        expect(content).toBe('---\ntags:\n  - personal\n  - work\n---\n\nBody')
    })

    test('round-trips tag names with special characters', () => {
        const content = buildNoteFileContent({ tags: ['a: b', 'has "quotes"'] }, 'Body')

        const { frontmatter, body } = parseFrontmatter(content)

        expect(frontmatter.tags).toEqual(['a: b', 'has "quotes"'])
        expect(body).toBe('Body')
    })

    test('defaults tags to an empty array', () => {
        const content = buildNoteFileContent({}, 'Body')

        const { frontmatter } = parseFrontmatter(content)

        expect(frontmatter.tags).toEqual([])
    })
})

describe('build note file content with invalid frontmatter', () => {
    test('writes the raw invalid block verbatim instead of the tags', () => {
        const content = buildNoteFileContent(
            { tags: ['ignored'], invalidFrontmatter: 'tags: [unterminated' },
            'Body'
        )

        expect(content).toBe('---\ntags: [unterminated\n---\n\nBody')
    })
})

describe('decompose note file content', () => {
    test('splits a valid file into body and tags', () => {
        const content = buildNoteFileContent({ tags: ['one', 'two'] }, 'Body')

        expect(decomposeNoteFileContent(content)).toEqual({
            body: 'Body',
            tags: ['one', 'two'],
            properties: {},
            invalidFrontmatter: null
        })
    })

    test('returns no tags and the raw block when the yaml is invalid', () => {
        const content = '---\ntags: [unterminated\n---\n\nBody'

        expect(decomposeNoteFileContent(content)).toEqual({
            body: 'Body',
            tags: null,
            properties: null,
            invalidFrontmatter: 'tags: [unterminated'
        })
    })

    test('returns empty tags when there is no frontmatter block', () => {
        expect(decomposeNoteFileContent('Just text')).toEqual({
            body: 'Just text',
            tags: [],
            properties: {},
            invalidFrontmatter: null
        })
    })

    test('round-trips invalid frontmatter through build and decompose', () => {
        const content = buildNoteFileContent({ invalidFrontmatter: 'a: [' }, 'Body')

        expect(decomposeNoteFileContent(content).invalidFrontmatter).toBe('a: [')
    })
})

describe('normalize tags', () => {
    test('keeps a list of tags as is', () => {
        expect(normalizeTags(['one', 'two'])).toEqual(['one', 'two'])
    })

    test('splits a string on commas and spaces', () => {
        expect(normalizeTags('one, two  three')).toEqual(['one', 'two', 'three'])
    })

    test('strips leading hashes and duplicates', () => {
        expect(normalizeTags(['#one', 'one', ' two '])).toEqual(['one', 'two'])
    })

    test('stringifies numeric tags', () => {
        expect(normalizeTags([2024])).toEqual(['2024'])
    })

    test('returns an empty list for missing or unsupported values', () => {
        expect(normalizeTags(undefined)).toEqual([])
        expect(normalizeTags({ a: 1 })).toEqual([])
    })
})

describe('note properties', () => {
    test('extracts every key except tags', () => {
        const frontmatter = { tags: ['a'], aliases: ['Alias'], cssclasses: 'wide' }

        expect(extractProperties(frontmatter)).toEqual({ aliases: ['Alias'], cssclasses: 'wide' })
    })

    test('writes unknown properties back next to the tags', () => {
        const content = buildNoteFileContent(
            { tags: ['a'], properties: { aliases: ['Alias'], rating: 5 } },
            'Body'
        )

        const { frontmatter, body } = parseFrontmatter(content)

        expect(frontmatter).toEqual({ aliases: ['Alias'], rating: 5, tags: ['a'] })
        expect(body).toBe('Body')
    })

    test('decomposes a file with comma separated tags and extra properties', () => {
        const content = '---\ntags: a, b\naliases:\n  - Alias\n---\n\nBody'

        expect(decomposeNoteFileContent(content)).toEqual({
            body: 'Body',
            tags: ['a', 'b'],
            properties: { aliases: ['Alias'] },
            invalidFrontmatter: null
        })
    })
})
