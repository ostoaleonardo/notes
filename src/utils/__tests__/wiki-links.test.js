import { resolveWikiLinks } from '../wiki-links'

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
