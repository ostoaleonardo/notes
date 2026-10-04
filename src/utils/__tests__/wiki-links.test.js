import {
    resolveWikiLinks,
    resolveWikiLinkTarget,
    findBacklinks,
    renameWikiLinksForNote,
    buildBacklinksHtml,
    parseMissingWikiLinkTarget
} from '../wiki-links'

const notes = [
    { path: 'note-1', title: 'Meeting Notes' },
    { path: 'note-2', title: 'Grocery List' }
]

describe('matching note', () => {
    test('renders a wiki link to the matching note path', () => {
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

    test('encodes the path so it survives as a single URL segment', () => {
        const withSpecialChars = [{ path: 'repo-1::My Note.md', title: 'My Note' }]
        const result = resolveWikiLinks('[[My Note]]', withSpecialChars)

        expect(result).toBe(
            '<a href="wikilink://repo-1%3A%3AMy%20Note.md" class="wiki-link">My Note</a>'
        )
    })
})

describe('code spans and blocks', () => {
    test('leaves a wiki link inside inline code untouched', () => {
        expect(resolveWikiLinks('use `[[Meeting Notes]]` here', notes)).toBe('use `[[Meeting Notes]]` here')
    })

    test('leaves a wiki link inside a fenced block untouched', () => {
        const value = '```\n[[Meeting Notes]]\n```'

        expect(resolveWikiLinks(value, notes)).toBe(value)
    })

    test('still resolves wiki links next to code', () => {
        const result = resolveWikiLinks('`code` [[Meeting Notes]]', notes)

        expect(result).toBe('`code` <a href="wikilink://note-1" class="wiki-link">Meeting Notes</a>')
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
        { path: 'root-test', title: 'Test' },
        { path: 'sub-test', title: 'Test' }
    ]
    const notePaths = new Map([
        ['root-test', ''],
        ['sub-test', 'one']
    ])

    test('a bare title resolves to the first candidate', () => {
        const target = resolveWikiLinkTarget('Test', duplicateNotes, notePaths)

        expect(target.path).toBe('root-test')
    })

    test('a path-qualified link resolves to the note in that folder', () => {
        const target = resolveWikiLinkTarget('one/Test', duplicateNotes, notePaths)

        expect(target.path).toBe('sub-test')
    })

    test('resolveWikiLinks renders a path-qualified link to the disambiguated note', () => {
        const result = resolveWikiLinks('[[one/Test]]', duplicateNotes, notePaths)

        expect(result).toBe('<a href="wikilink://sub-test" class="wiki-link">Test</a>')
    })
})

describe('findBacklinks', () => {
    const linkingNotes = [
        { path: 'target', title: 'Grocery List', note: 'Some content.' },
        { path: 'a', title: 'Recipe', note: 'See [[Grocery List]] for what to buy.' },
        { path: 'b', title: 'Other', note: 'No links here.' },
        { path: 'c', title: 'Alias Note', note: 'Mentions [[grocery list|itself]] via alias.' }
    ]

    test('finds notes whose content links to the given note', () => {
        const result = findBacklinks('target', linkingNotes)

        expect(result.map((note) => note.path)).toEqual(['a', 'c'])
    })

    test('matches case-insensitively and through aliases', () => {
        const result = findBacklinks('target', linkingNotes)

        expect(result.map((note) => note.path)).toContain('c')
    })

    test('never includes the note itself', () => {
        const result = findBacklinks('target', linkingNotes)

        expect(result.map((note) => note.path)).not.toContain('target')
    })

    test('returns an empty array when nothing links to the note', () => {
        const result = findBacklinks('unlinked-path', linkingNotes)

        expect(result).toEqual([])
    })

    test('only counts links that resolve to the note in the right folder', () => {
        const duplicateNotes = [
            { path: 'root-test', title: 'Test', note: '' },
            { path: 'sub-test', title: 'Test', note: '' },
            { path: 'linker', title: 'Linker', note: 'See [[one/Test]] for details' }
        ]
        const notePaths = new Map([
            ['root-test', ''],
            ['sub-test', 'one']
        ])

        expect(findBacklinks('sub-test', duplicateNotes, notePaths).map((n) => n.path)).toEqual(['linker'])
        expect(findBacklinks('root-test', duplicateNotes, notePaths)).toEqual([])
    })

    test('also counts markdown-format internal links', () => {
        const markdownLinkingNotes = [
            { path: 'target', title: 'Grocery List', note: '' },
            { path: 'a', title: 'Recipe', note: 'See [Grocery List](wikilink://target) for what to buy.' },
            { path: 'b', title: 'Other', note: 'See [something](wikilink://other-path) instead.' }
        ]

        const result = findBacklinks('target', markdownLinkingNotes)

        expect(result.map((note) => note.path)).toEqual(['a'])
    })
})

describe('renameWikiLinksForNote', () => {
    test('renames a link that resolves to the target note', () => {
        const notesForRename = [{ path: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote(
            'See [[Grocery List]] for details',
            'target',
            'Shopping List',
            notesForRename
        )

        expect(result).toBe('See [[Shopping List]] for details')
    })

    test('preserves the alias when renaming', () => {
        const notesForRename = [{ path: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote(
            'See [[Grocery List|the list]] for details',
            'target',
            'Shopping List',
            notesForRename
        )

        expect(result).toBe('See [[Shopping List|the list]] for details')
    })

    test('matches case-insensitively', () => {
        const notesForRename = [{ path: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote('[[grocery list]]', 'target', 'Shopping List', notesForRename)

        expect(result).toBe('[[Shopping List]]')
    })

    test('leaves links that resolve to a different note unchanged', () => {
        const notesForRename = [
            { path: 'target', title: 'Grocery List' },
            { path: 'other', title: 'Meeting Notes' }
        ]
        const result = renameWikiLinksForNote('[[Meeting Notes]]', 'target', 'Shopping List', notesForRename)

        expect(result).toBe('[[Meeting Notes]]')
    })

    test('leaves a same-titled note in a different folder unchanged', () => {
        const duplicateNotes = [
            { path: 'root-test', title: 'Test' },
            { path: 'sub-test', title: 'Test' }
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
            { path: 'sub-test', title: 'Test' },
            { path: 'other', title: 'Fold' }
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
            { path: 'root-test', title: 'Test' },
            { path: 'other', title: 'Fold' }
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

    test('renders a link per backlink using the note path and title', () => {
        const result = buildBacklinksHtml([{ path: 'note-1', title: 'Recipe' }], 'Backlinks')

        expect(result).toContain('href="wikilink://note-1"')
        expect(result).toContain('>Recipe<')
        expect(result).toContain('>Backlinks<')
    })

    test('escapes html characters in titles and the label', () => {
        const result = buildBacklinksHtml([{ path: 'note-1', title: '<b>Bold</b>' }], '<i>Label</i>')

        expect(result).not.toContain('<b>Bold</b>')
        expect(result).toContain('&lt;b&gt;Bold&lt;/b&gt;')
        expect(result).toContain('&lt;i&gt;Label&lt;/i&gt;')
    })

    test('shows the folder path under the title, similar to Obsidian, when the note is not at the root', () => {
        const notePaths = new Map([['note-1', 'one']])
        const result = buildBacklinksHtml([{ path: 'note-1', title: 'Test' }], 'Backlinks', notePaths)

        expect(result).toContain('<span class="backlink-path">one</span>')
    })

    test('omits the path subtext for a root-level note', () => {
        const notePaths = new Map([['note-1', '']])
        const result = buildBacklinksHtml([{ path: 'note-1', title: 'Test' }], 'Backlinks', notePaths)

        expect(result).not.toContain('backlink-path')
    })
})

describe('heading and block anchors', () => {
    test('resolves a heading link to its note and shows the heading in the label', () => {
        const result = resolveWikiLinks('[[Meeting Notes#Agenda]]', notes)

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">Meeting Notes &gt; Agenda</a>')
    })

    test('resolves a block link to its note', () => {
        const result = resolveWikiLinks('[[Meeting Notes#^abc123]]', notes)

        expect(result).toContain('href="wikilink://note-1#%5Eabc123"')
    })

    test('uses the alias as the label when provided', () => {
        const result = resolveWikiLinks('[[Meeting Notes#Agenda|the agenda]]', notes)

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">the agenda</a>')
    })

    test('resolves a path-qualified heading link', () => {
        const duplicateNotes = [
            { path: 'root-test', title: 'Test' },
            { path: 'sub-test', title: 'Test' }
        ]
        const notePaths = new Map([
            ['root-test', ''],
            ['sub-test', 'one']
        ])

        const target = resolveWikiLinkTarget('one/Test#Heading', duplicateNotes, notePaths)

        expect(target.path).toBe('sub-test')
    })

    test('prefers a note whose title contains the hash over splitting at it', () => {
        const hashNotes = [
            { path: 'c', title: 'C' },
            { path: 'c-sharp', title: 'C# notes' }
        ]

        expect(resolveWikiLinkTarget('C# notes', hashNotes).path).toBe('c-sharp')
    })

    test('a missing heading link carries the title without the anchor', () => {
        const result = resolveWikiLinks('[[Unknown#Heading]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing//Unknown" class="wiki-link-broken">Unknown &gt; Heading</a>'
        )
    })

    test('a same-note heading link renders as plain text without the current note', () => {
        expect(resolveWikiLinks('[[#Agenda]]', notes)).toBe('Agenda')
    })

    test('a same-note heading link points to the current note', () => {
        const result = resolveWikiLinks('[[#Agenda]]', notes, new Map(), 'note-1')

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">#Agenda</a>')
    })

    test('a same-note heading link uses the alias as the label', () => {
        const result = resolveWikiLinks('[[#Agenda|the agenda]]', notes, new Map(), 'note-1')

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">the agenda</a>')
    })

    test('a same-note block link points to the current note', () => {
        const result = resolveWikiLinks('[[#^abc123]]', notes, new Map(), 'note-1')

        expect(result).toContain('href="wikilink://note-1#%5Eabc123"')
    })

    test('counts heading links as backlinks', () => {
        const linkingNotes = [
            { path: 'target', title: 'Grocery List', note: '' },
            { path: 'a', title: 'Recipe', note: 'See [[Grocery List#Fruit]]' }
        ]

        expect(findBacklinks('target', linkingNotes).map((note) => note.path)).toEqual(['a'])
    })

    test('keeps the anchor when renaming', () => {
        const notesForRename = [{ path: 'target', title: 'Grocery List' }]
        const result = renameWikiLinksForNote(
            '[[Grocery List#Fruit]] and [[Grocery List#^b1|block]]',
            'target',
            'Shopping List',
            notesForRename
        )

        expect(result).toBe('[[Shopping List#Fruit]] and [[Shopping List#^b1|block]]')
    })
})

describe('frontmatter aliases', () => {
    const aliasNotes = [
        { path: 'note-1', title: 'Meeting Notes', properties: { aliases: ['Standup', 'Sync'] } },
        { path: 'note-2', title: 'Standup' }
    ]

    test('resolves a link written with an alias', () => {
        const target = resolveWikiLinkTarget('Sync', aliasNotes)

        expect(target.path).toBe('note-1')
    })

    test('accepts a single string alias', () => {
        const target = resolveWikiLinkTarget('Daily', [{ path: 'a', title: 'A', properties: { aliases: 'Daily' } }])

        expect(target.path).toBe('a')
    })

    test('prefers a title match over an alias match', () => {
        const target = resolveWikiLinkTarget('Standup', aliasNotes)

        expect(target.path).toBe('note-2')
    })

    test('counts alias links as backlinks', () => {
        const linkingNotes = [...aliasNotes, { path: 'a', title: 'Recipe', note: 'See [[Sync]]' }]

        expect(findBacklinks('note-1', linkingNotes).map((note) => note.path)).toEqual(['a'])
    })

    test('does not rewrite links that matched through an alias when the title changes', () => {
        const result = renameWikiLinksForNote('[[Sync]] and [[Meeting Notes]]', 'note-1', 'Retro', aliasNotes)

        expect(result).toBe('[[Sync]] and [[Retro]]')
    })
})

describe('unicode normalization', () => {
    test('matches a decomposed link to a composed title', () => {
        const composed = [{ path: 'cafe', title: 'Caf\u00e9' }]

        expect(resolveWikiLinkTarget('Cafe\u0301', composed).path).toBe('cafe')
    })
})

describe('file links', () => {
    test('renders a link to a vault file as a file link', () => {
        const result = resolveWikiLinks('[[docs/sample doc.pdf]]', notes)

        expect(result).toBe(
            '<a href="filelink://docs%2Fsample%20doc.pdf" class="file-link">sample doc.pdf</a>'
        )
    })

    test('uses the alias as the label and drops the anchor from the target', () => {
        const result = resolveWikiLinks('[[sample.pdf#page=2|Manual]]', notes)

        expect(result).toBe('<a href="filelink://sample.pdf" class="file-link">Manual</a>')
    })

    test('keeps a note with a file-like title as a note link', () => {
        const result = resolveWikiLinks('[[spec.pdf]]', [{ path: 'note-3', title: 'spec.pdf' }])

        expect(result).toBe('<a href="wikilink://note-3" class="wiki-link">spec.pdf</a>')
    })
})
