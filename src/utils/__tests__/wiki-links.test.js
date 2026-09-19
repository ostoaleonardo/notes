import { resolveWikiLinks, findBacklinks, renameWikiLinks, buildBacklinksHtml } from '../wiki-links'

const notes = [
    { id: 'note-1', title: 'Meeting Notes' },
    { id: 'note-2', title: 'Grocery List' }
]

describe('matching note', () => {
    test('renders a wiki link to the matching note id', () => {
        const result = resolveWikiLinks('See [[Meeting Notes]] for details', notes)

        expect(result).toBe('See <a href="wikilink://note-1" class="wiki-link">Meeting Notes</a> for details')
    })

    test('matches the title case-insensitively', () => {
        const result = resolveWikiLinks('[[meeting notes]]', notes)

        expect(result).toBe('<a href="wikilink://note-1" class="wiki-link">meeting notes</a>')
    })

    test('uses the alias as the label when provided', () => {
        const result = resolveWikiLinks('[[Meeting Notes|notes from today]]', notes)

        expect(result).toBe('<a href="wikilink://note-1" class="wiki-link">notes from today</a>')
    })
})

describe('missing note', () => {
    test('renders a broken link span when no note matches the title', () => {
        const result = resolveWikiLinks('[[Unknown Note]]', notes)

        expect(result).toBe('<span class="wiki-link-broken">Unknown Note</span>')
    })
})

describe('label escaping', () => {
    test('escapes html characters in the label', () => {
        const result = resolveWikiLinks('[[Unknown Note|<b>bold</b>]]', notes)

        expect(result).toBe('<span class="wiki-link-broken">&lt;b&gt;bold&lt;/b&gt;</span>')
    })
})

describe('plain text', () => {
    test('leaves text without wiki links unchanged', () => {
        const result = resolveWikiLinks('Just a regular paragraph.', notes)

        expect(result).toBe('Just a regular paragraph.')
    })
})

describe('findBacklinks', () => {
    const linkingNotes = [
        { id: 'a', title: 'Recipe', note: 'See [[Grocery List]] for what to buy.' },
        { id: 'b', title: 'Other', note: 'No links here.' },
        { id: 'c', title: 'Grocery List', note: 'Mentions [[grocery list|itself]] via alias.' }
    ]

    test('finds notes whose content links to the given title', () => {
        const result = findBacklinks('Grocery List', linkingNotes)

        expect(result.map((note) => note.id)).toEqual(['a', 'c'])
    })

    test('matches case-insensitively and through aliases', () => {
        const result = findBacklinks('grocery list', linkingNotes)

        expect(result.map((note) => note.id)).toContain('c')
    })

    test('excludes a note id when provided', () => {
        const result = findBacklinks('Grocery List', linkingNotes, 'c')

        expect(result.map((note) => note.id)).toEqual(['a'])
    })

    test('returns an empty array when nothing links to the title', () => {
        const result = findBacklinks('Unlinked', linkingNotes)

        expect(result).toEqual([])
    })
})

describe('renameWikiLinks', () => {
    test('renames a matching wiki link', () => {
        const result = renameWikiLinks('See [[Grocery List]] for details', 'Grocery List', 'Shopping List')

        expect(result).toBe('See [[Shopping List]] for details')
    })

    test('preserves the alias when renaming', () => {
        const result = renameWikiLinks('See [[Grocery List|the list]] for details', 'Grocery List', 'Shopping List')

        expect(result).toBe('See [[Shopping List|the list]] for details')
    })

    test('matches case-insensitively', () => {
        const result = renameWikiLinks('[[grocery list]]', 'Grocery List', 'Shopping List')

        expect(result).toBe('[[Shopping List]]')
    })

    test('leaves links to other titles unchanged', () => {
        const result = renameWikiLinks('[[Meeting Notes]]', 'Grocery List', 'Shopping List')

        expect(result).toBe('[[Meeting Notes]]')
    })
})

describe('buildBacklinksHtml', () => {
    test('returns an empty string when there are no backlinks', () => {
        expect(buildBacklinksHtml([], 'Backlinks')).toBe('')
    })

    test('renders a link per backlink using the note id and title', () => {
        const result = buildBacklinksHtml([{ id: 'note-1', title: 'Recipe' }], 'Backlinks')

        expect(result).toContain('href="wikilink://note-1"')
        expect(result).toContain('>Recipe<')
        expect(result).toContain('>Backlinks<')
    })

    test('escapes html characters in titles and the label', () => {
        const result = buildBacklinksHtml([{ id: 'note-1', title: '<b>Bold</b>' }], '<i>Label</i>')

        expect(result).not.toContain('<b>Bold</b>')
        expect(result).toContain('&lt;b&gt;Bold&lt;/b&gt;')
        expect(result).toContain('&lt;i&gt;Label&lt;/i&gt;')
    })
})
