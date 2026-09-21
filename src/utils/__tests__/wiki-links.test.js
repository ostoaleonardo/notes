import {
    resolveWikiLinks,
    resolveWikiLinkTarget,
    findBacklinks,
    renameWikiLinksForNote,
    buildBacklinksHtml,
    parseMissingWikiLinkTarget
} from '../wiki-links'

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
    test('renders a clickable broken link carrying the missing title when no note matches', () => {
        const result = resolveWikiLinks('[[Unknown Note]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing//Unknown%20Note" class="wiki-link-broken">Unknown Note</a>'
        )
    })

    test('carries the folder path so a note created from it lands in the right place', () => {
        const result = resolveWikiLinks('[[one/Unknown Note]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing/one/Unknown%20Note" class="wiki-link-broken">Unknown Note</a>'
        )
    })
})

describe('label escaping', () => {
    test('escapes html characters in the label', () => {
        const result = resolveWikiLinks('[[Unknown Note|<b>bold</b>]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing//Unknown%20Note" class="wiki-link-broken">&lt;b&gt;bold&lt;/b&gt;</a>'
        )
    })
})

describe('parseMissingWikiLinkTarget', () => {
    test('splits the encoded path and title back apart', () => {
        expect(parseMissingWikiLinkTarget('one/Unknown%20Note')).toEqual({ path: 'one', title: 'Unknown Note' })
    })

    test('returns an empty path for a root-level missing note', () => {
        expect(parseMissingWikiLinkTarget('/Unknown%20Note')).toEqual({ path: '', title: 'Unknown Note' })
    })
})

describe('plain text', () => {
    test('leaves text without wiki links unchanged', () => {
        const result = resolveWikiLinks('Just a regular paragraph.', notes)

        expect(result).toBe('Just a regular paragraph.')
    })
})

describe('duplicate titles across folders', () => {
    const duplicateNotes = [
        { id: 'root-test', title: 'Test' },
        { id: 'sub-test', title: 'Test' }
    ]
    const notePaths = new Map([
        ['root-test', ''],
        ['sub-test', 'one']
    ])

    test('a bare title resolves to the first candidate', () => {
        const target = resolveWikiLinkTarget('Test', duplicateNotes, notePaths)

        expect(target.id).toBe('root-test')
    })

    test('a path-qualified link resolves to the note in that folder', () => {
        const target = resolveWikiLinkTarget('one/Test', duplicateNotes, notePaths)

        expect(target.id).toBe('sub-test')
    })

    test('resolveWikiLinks renders a path-qualified link to the disambiguated note', () => {
        const result = resolveWikiLinks('[[one/Test]]', duplicateNotes, notePaths)

        expect(result).toBe('<a href="wikilink://sub-test" class="wiki-link">Test</a>')
    })
})

describe('findBacklinks', () => {
    const linkingNotes = [
        { id: 'target', title: 'Grocery List', note: 'Some content.' },
        { id: 'a', title: 'Recipe', note: 'See [[Grocery List]] for what to buy.' },
        { id: 'b', title: 'Other', note: 'No links here.' },
        { id: 'c', title: 'Alias Note', note: 'Mentions [[grocery list|itself]] via alias.' }
    ]

    test('finds notes whose content links to the given note', () => {
        const result = findBacklinks('target', linkingNotes)

        expect(result.map((note) => note.id)).toEqual(['a', 'c'])
    })

    test('matches case-insensitively and through aliases', () => {
        const result = findBacklinks('target', linkingNotes)

        expect(result.map((note) => note.id)).toContain('c')
    })

    test('never includes the note itself', () => {
        const result = findBacklinks('target', linkingNotes)

        expect(result.map((note) => note.id)).not.toContain('target')
    })

    test('returns an empty array when nothing links to the note', () => {
        const result = findBacklinks('unlinked-id', linkingNotes)

        expect(result).toEqual([])
    })

    test('only counts links that resolve to the note in the right folder', () => {
        const duplicateNotes = [
            { id: 'root-test', title: 'Test', note: '' },
            { id: 'sub-test', title: 'Test', note: '' },
            { id: 'linker', title: 'Linker', note: 'See [[one/Test]] for details' }
        ]
        const notePaths = new Map([
            ['root-test', ''],
            ['sub-test', 'one']
        ])

        expect(findBacklinks('sub-test', duplicateNotes, notePaths).map((n) => n.id)).toEqual(['linker'])
        expect(findBacklinks('root-test', duplicateNotes, notePaths)).toEqual([])
    })

    test('also counts markdown-format internal links', () => {
        const markdownLinkingNotes = [
            { id: 'target', title: 'Grocery List', note: '' },
            { id: 'a', title: 'Recipe', note: 'See [Grocery List](wikilink://target) for what to buy.' },
            { id: 'b', title: 'Other', note: 'See [something](wikilink://other-id) instead.' }
        ]

        const result = findBacklinks('target', markdownLinkingNotes)

        expect(result.map((note) => note.id)).toEqual(['a'])
    })
})

describe('renameWikiLinksForNote', () => {
    test('renames a link that resolves to the target note', () => {
        const notesForRename = [{ id: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote(
            'See [[Grocery List]] for details',
            'target',
            'Shopping List',
            notesForRename
        )

        expect(result).toBe('See [[Shopping List]] for details')
    })

    test('preserves the alias when renaming', () => {
        const notesForRename = [{ id: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote(
            'See [[Grocery List|the list]] for details',
            'target',
            'Shopping List',
            notesForRename
        )

        expect(result).toBe('See [[Shopping List|the list]] for details')
    })

    test('matches case-insensitively', () => {
        const notesForRename = [{ id: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote('[[grocery list]]', 'target', 'Shopping List', notesForRename)

        expect(result).toBe('[[Shopping List]]')
    })

    test('leaves links that resolve to a different note unchanged', () => {
        const notesForRename = [
            { id: 'target', title: 'Grocery List' },
            { id: 'other', title: 'Meeting Notes' }
        ]
        const result = renameWikiLinksForNote('[[Meeting Notes]]', 'target', 'Shopping List', notesForRename)

        expect(result).toBe('[[Meeting Notes]]')
    })

    test('leaves a same-titled note in a different folder unchanged', () => {
        const duplicateNotes = [
            { id: 'root-test', title: 'Test' },
            { id: 'sub-test', title: 'Test' }
        ]
        const notePaths = new Map([
            ['root-test', ''],
            ['sub-test', 'one']
        ])

        const result = renameWikiLinksForNote(
            'Links to [[Test]] and [[one/Test]]',
            'root-test',
            'Renamed',
            duplicateNotes,
            notePaths
        )

        expect(result).toBe('Links to [[Renamed]] and [[one/Test]]')
    })

    test('re-qualifies with the folder path when the new title collides with another note', () => {
        const duplicateNotes = [
            { id: 'sub-test', title: 'Test' },
            { id: 'other', title: 'Fold' }
        ]
        const notePaths = new Map([
            ['sub-test', 'one'],
            ['other', '']
        ])

        const result = renameWikiLinksForNote(
            'See [[Test]] here',
            'sub-test',
            'Fold',
            duplicateNotes,
            notePaths
        )

        expect(result).toBe('See [[one/Fold|Fold]] here')
    })

    test('does not qualify when the renamed note has no folder to qualify with', () => {
        const duplicateNotes = [
            { id: 'root-test', title: 'Test' },
            { id: 'other', title: 'Fold' }
        ]
        const notePaths = new Map([
            ['root-test', ''],
            ['other', '']
        ])

        const result = renameWikiLinksForNote(
            'See [[Test]] here',
            'root-test',
            'Fold',
            duplicateNotes,
            notePaths
        )

        expect(result).toBe('See [[Fold]] here')
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

    test('shows the folder path under the title, similar to Obsidian, when the note is not at the root', () => {
        const notePaths = new Map([['note-1', 'one']])
        const result = buildBacklinksHtml([{ id: 'note-1', title: 'Test' }], 'Backlinks', notePaths)

        expect(result).toContain('<span class="backlink-path">one</span>')
    })

    test('omits the path subtext for a root-level note', () => {
        const notePaths = new Map([['note-1', '']])
        const result = buildBacklinksHtml([{ id: 'note-1', title: 'Test' }], 'Backlinks', notePaths)

        expect(result).not.toContain('backlink-path')
    })
})
