import {
    renderWikiLink,
    resolveWikiLinkDetails,
    resolveWikiLinkTarget,
    buildBacklinksHtml,
    parseMissingWikiLinkTarget
} from '../wiki-links'

const renderLink = (value, notes, folderPathByNote = new Map(), selfPath) => {
    const [, linkText, alias] = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/.exec(value)

    return renderWikiLink(alias, resolveWikiLinkDetails(linkText, notes, folderPathByNote, selfPath))
}

const notes = [
    { path: 'note-1', title: 'Meeting Notes' },
    { path: 'note-2', title: 'Grocery List' }
]

describe('matching note', () => {
    test('renders a wiki link to the matching note path', () => {
        const result = renderLink('[[Meeting Notes]]', notes)

        expect(result).toBe(
            '<a href="wikilink://note-1" class="wiki-link">Meeting Notes</a>'
        )
    })

    test('matches the title case-insensitively', () => {
        const result = renderLink('[[meeting notes]]', notes)

        expect(result).toBe('<a href="wikilink://note-1" class="wiki-link">meeting notes</a>')
    })

    test('uses the alias as the label when provided', () => {
        const result = renderLink('[[Meeting Notes|notes from today]]', notes)

        expect(result).toBe('<a href="wikilink://note-1" class="wiki-link">notes from today</a>')
    })

    test('encodes the path so it survives as a single URL segment', () => {
        const withSpecialChars = [{ path: 'repo-1::My Note.md', title: 'My Note' }]
        const result = renderLink('[[My Note]]', withSpecialChars)

        expect(result).toBe(
            '<a href="wikilink://repo-1%3A%3AMy%20Note.md" class="wiki-link">My Note</a>'
        )
    })
})

describe('missing note', () => {
    test('renders a clickable broken link carrying the missing title when no note matches', () => {
        const result = renderLink('[[Unknown Note]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing//Unknown%20Note" ' +
            'class="wiki-link-broken">Unknown Note</a>'
        )
    })

    test('carries the folder path so a note created from it lands in the right place', () => {
        const result = renderLink('[[one/Unknown Note]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing/one/Unknown%20Note" ' +
            'class="wiki-link-broken">Unknown Note</a>'
        )
    })
})

describe('label escaping', () => {
    test('escapes html characters in the label', () => {
        const result = renderLink('[[Unknown Note|<b>bold</b>]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing//Unknown%20Note" ' +
            'class="wiki-link-broken">&lt;b&gt;bold&lt;/b&gt;</a>'
        )
    })
})

describe('missing wiki link target', () => {
    test('splits the encoded path and title back apart', () => {
        expect(parseMissingWikiLinkTarget('one/Unknown%20Note')).toEqual(
            { path: 'one', title: 'Unknown Note' }
        )
    })

    test('returns an empty path for a root-level missing note', () => {
        expect(parseMissingWikiLinkTarget('/Unknown%20Note')).toEqual(
            { path: '', title: 'Unknown Note' }
        )
    })
})

describe('duplicate titles across folders', () => {
    const duplicateNotes = [
        { path: 'root-test', title: 'Test' },
        { path: 'sub-test', title: 'Test' }
    ]
    const folderPathByNote = new Map([
        ['root-test', ''],
        ['sub-test', 'one']
    ])

    test('a bare title resolves to the first candidate', () => {
        const target = resolveWikiLinkTarget('Test', duplicateNotes, folderPathByNote)

        expect(target.path).toBe('root-test')
    })

    test('a path-qualified link resolves to the note in that folder', () => {
        const target = resolveWikiLinkTarget('one/Test', duplicateNotes, folderPathByNote)

        expect(target.path).toBe('sub-test')
    })

    test('renders a path-qualified link to the disambiguated note', () => {
        const result = renderLink('[[one/Test]]', duplicateNotes, folderPathByNote)

        expect(result).toBe('<a href="wikilink://sub-test" class="wiki-link">Test</a>')
    })
})

describe('backlinks html', () => {
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
        const result = buildBacklinksHtml(
            [{ path: 'note-1', title: '<b>Bold</b>' }],
            '<i>Label</i>'
        )

        expect(result).not.toContain('<b>Bold</b>')
        expect(result).toContain('&lt;b&gt;Bold&lt;/b&gt;')
        expect(result).toContain('&lt;i&gt;Label&lt;/i&gt;')
    })

    test('shows the folder path under the title when the note is not at the root', () => {
        const folderPathByNote = new Map([['note-1', 'one']])
        const result = buildBacklinksHtml(
            [{ path: 'note-1', title: 'Test' }],
            'Backlinks',
            folderPathByNote
        )

        expect(result).toContain('<span class="backlink-path">one</span>')
    })

    test('omits the path subtext for a root-level note', () => {
        const folderPathByNote = new Map([['note-1', '']])
        const result = buildBacklinksHtml(
            [{ path: 'note-1', title: 'Test' }],
            'Backlinks',
            folderPathByNote
        )

        expect(result).not.toContain('backlink-path')
    })
})

describe('heading and block anchors', () => {
    test('resolves a heading link to its note and shows the heading in the label', () => {
        const result = renderLink('[[Meeting Notes#Agenda]]', notes)

        expect(result).toBe(
            '<a href="wikilink://note-1#Agenda" class="wiki-link">Meeting Notes &gt; Agenda</a>'
        )
    })

    test('resolves a block link to its note', () => {
        const result = renderLink('[[Meeting Notes#^abc123]]', notes)

        expect(result).toContain('href="wikilink://note-1#%5Eabc123"')
    })

    test('uses the alias as the label when provided', () => {
        const result = renderLink('[[Meeting Notes#Agenda|the agenda]]', notes)

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">the agenda</a>')
    })

    test('resolves a path-qualified heading link', () => {
        const duplicateNotes = [
            { path: 'root-test', title: 'Test' },
            { path: 'sub-test', title: 'Test' }
        ]
        const folderPathByNote = new Map([
            ['root-test', ''],
            ['sub-test', 'one']
        ])

        const target = resolveWikiLinkTarget('one/Test#Heading', duplicateNotes, folderPathByNote)

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
        const result = renderLink('[[Unknown#Heading]]', notes)

        expect(result).toBe(
            '<a href="wikilink://missing//Unknown" ' +
            'class="wiki-link-broken">Unknown &gt; Heading</a>'
        )
    })

    test('a same-note heading link renders as plain text without the current note', () => {
        expect(renderLink('[[#Agenda]]', notes)).toBe('Agenda')
    })

    test('a same-note heading link points to the current note', () => {
        const result = renderLink('[[#Agenda]]', notes, new Map(), 'note-1')

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">#Agenda</a>')
    })

    test('a same-note heading link uses the alias as the label', () => {
        const result = renderLink('[[#Agenda|the agenda]]', notes, new Map(), 'note-1')

        expect(result).toBe('<a href="wikilink://note-1#Agenda" class="wiki-link">the agenda</a>')
    })

    test('a same-note block link points to the current note', () => {
        const result = renderLink('[[#^abc123]]', notes, new Map(), 'note-1')

        expect(result).toContain('href="wikilink://note-1#%5Eabc123"')
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
        const target = resolveWikiLinkTarget(
            'Daily',
            [{ path: 'a', title: 'A', properties: { aliases: 'Daily' } }]
        )

        expect(target.path).toBe('a')
    })

    test('prefers a title match over an alias match', () => {
        const target = resolveWikiLinkTarget('Standup', aliasNotes)

        expect(target.path).toBe('note-2')
    })
})

describe('unicode normalization', () => {
    test('matches a decomposed link to a composed title', () => {
        const composed = [{ path: 'cafe', title: 'Caf\u00e9' }]

        expect(resolveWikiLinkTarget('Cafe\u0301', composed).path).toBe('cafe')
    })
})

describe('file links', () => {
    test('renders a link to a repository file as a file link', () => {
        const result = renderLink('[[docs/sample doc.pdf]]', notes)

        expect(result).toBe(
            '<a href="filelink://docs%2Fsample%20doc.pdf" class="file-link">sample doc.pdf</a>'
        )
    })

    test('uses the alias as the label and drops the anchor from the target', () => {
        const result = renderLink('[[sample.pdf#page=2|Manual]]', notes)

        expect(result).toBe('<a href="filelink://sample.pdf" class="file-link">Manual</a>')
    })

    test('keeps a note with a file-like title as a note link', () => {
        const result = renderLink('[[spec.pdf]]', [{ path: 'note-3', title: 'spec.pdf' }])

        expect(result).toBe('<a href="wikilink://note-3" class="wiki-link">spec.pdf</a>')
    })
})
