import {
    buildNoteFileContent,
    decomposeNoteFileContent,
    extractProperties,
    normalizeTags,
    parseFrontmatter,
    readFrontmatterTags
} from '../frontmatter'

describe('parse frontmatter', () => {
    test('extracts tags and dates from a leading frontmatter block', () => {
        const content = '---\ntags:\n  - one\n  - two\n'
            + 'createdAt: 100\nupdatedAt: 200\n---\n\nHello world'

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

    test('accepts a closing fence at the end of the file without a trailing newline', () => {
        const { frontmatter, body, hasBlock } = parseFrontmatter('---\ntags: [one]\n---')

        expect(frontmatter.tags).toEqual(['one'])
        expect(body).toBe('')
        expect(hasBlock).toBe(true)
    })

    test('does not close the block on a fence followed by other characters', () => {
        const content = '---\ntags: [one]\n---x\n'

        expect(parseFrontmatter(content).hasBlock).toBe(false)
    })

    test('treats two adjacent dash fences as having no frontmatter block', () => {
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

    test('flags invalid yaml in the frontmatter as an error and keeps the raw text', () => {
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

describe('build note file content', () => {
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

    test('omits the block when there are no tags or properties', () => {
        expect(buildNoteFileContent({ tags: [], properties: {} }, 'Body')).toBe('Body')
        expect(buildNoteFileContent({}, 'Body')).toBe('Body')
    })

    test('keeps an empty block when the body itself starts with a fence', () => {
        const body = '---\nrule\n---\nText'
        const content = buildNoteFileContent({ tags: [] }, body)

        expect(parseFrontmatter(content).body).toBe(body)
    })

    test('omits the tags key when there are properties but no tags', () => {
        const content = buildNoteFileContent({ properties: { author: 'Ana' } }, 'Body')

        const { frontmatter } = parseFrontmatter(content)

        expect(frontmatter).toEqual({ author: 'Ana' })
    })
})

describe('build note file content with the original raw block', () => {
    const rawFrontmatter = '# my comment\nzeta: 1\ntags: [b, a]\nalpha: 2'

    test('keeps comments and key order when tags and properties are unchanged', () => {
        const content = buildNoteFileContent(
            { tags: ['b', 'a'], properties: { zeta: 1, alpha: 2 }, rawFrontmatter },
            'Body'
        )

        expect(content).toBe(`---\n${rawFrontmatter}\n---\n\nBody`)
    })

    test('rewrites the block when the tags changed', () => {
        const content = buildNoteFileContent(
            { tags: ['b'], properties: { zeta: 1, alpha: 2 }, rawFrontmatter },
            'Body'
        )

        expect(content).not.toContain('# my comment')
        expect(parseFrontmatter(content).frontmatter.tags).toEqual(['b'])
    })

    test('rewrites the block when a property changed', () => {
        const content = buildNoteFileContent(
            { tags: ['b', 'a'], properties: { zeta: 9, alpha: 2 }, rawFrontmatter },
            'Body'
        )

        expect(parseFrontmatter(content).frontmatter.zeta).toBe(9)
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
            invalidFrontmatter: null,
            rawFrontmatter: 'tags:\n  - one\n  - two'
        })
    })

    test('returns no tags and the raw block when the yaml is invalid', () => {
        const content = '---\ntags: [unterminated\n---\n\nBody'

        expect(decomposeNoteFileContent(content)).toEqual({
            body: 'Body',
            tags: null,
            properties: null,
            invalidFrontmatter: 'tags: [unterminated',
            rawFrontmatter: null
        })
    })

    test('returns empty tags when there is no frontmatter block', () => {
        expect(decomposeNoteFileContent('Just text')).toEqual({
            body: 'Just text',
            tags: [],
            properties: {},
            invalidFrontmatter: null,
            rawFrontmatter: null
        })
    })

    test('keeps the yaml comments of the raw block', () => {
        const content = '---\ntags:\n  - one # keep\n---\n\nBody'

        expect(decomposeNoteFileContent(content).rawFrontmatter).toBe('tags:\n  - one # keep')
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

    test('drops tags made only of digits', () => {
        expect(normalizeTags([2024, '2024', 'y2024'])).toEqual(['y2024'])
    })

    test('joins words with hyphens and removes invalid characters', () => {
        expect(normalizeTags(['my tag!', 'a/b/', 'x,y'])).toEqual(['my-tag', 'a/b', 'xy'])
    })

    test('drops entries that are not strings or numbers', () => {
        expect(normalizeTags(['one', { aliases: ['foo'] }, ['nested'], null])).toEqual(['one'])
    })

    test('returns an empty list for missing or unsupported values', () => {
        expect(normalizeTags(undefined)).toEqual([])
        expect(normalizeTags({ a: 1 })).toEqual([])
    })
})

describe('read frontmatter tags', () => {
    test('reads the tags key as a list or a string', () => {
        expect(readFrontmatterTags({ tags: ['one', 'two'] })).toEqual(['one', 'two'])
        expect(readFrontmatterTags({ tags: 'one, two' })).toEqual(['one', 'two'])
    })

    test('reads the singular tag key too', () => {
        expect(readFrontmatterTags({ tag: 'one' })).toEqual(['one'])
    })

    test('merges both keys without duplicates', () => {
        expect(readFrontmatterTags({ tags: ['One'], tag: 'one two' })).toEqual(['One', 'two'])
    })

    test('returns an empty list when no key is present', () => {
        expect(readFrontmatterTags({})).toEqual([])
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

    test('writes date properties unquoted', () => {
        const content = buildNoteFileContent(
            { tags: [], properties: { due: '2026-10-04', at: '2026-10-04T09:30' } },
            'Body'
        )

        expect(content).toContain('due: 2026-10-04\n')
        expect(content).toContain('at: 2026-10-04T09:30\n')
        expect(parseFrontmatter(content).frontmatter).toEqual({
            due: '2026-10-04',
            at: '2026-10-04T09:30'
        })
    })

    test('decomposes a file with comma separated tags and extra properties', () => {
        const content = '---\ntags: a, b\naliases:\n  - Alias\n---\n\nBody'

        expect(decomposeNoteFileContent(content)).toEqual({
            body: 'Body',
            tags: ['a', 'b'],
            properties: { aliases: ['Alias'] },
            invalidFrontmatter: null,
            rawFrontmatter: 'tags: a, b\naliases:\n  - Alias'
        })
    })
})
