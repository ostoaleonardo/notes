import {
    buildUnlinkedMentionsHtml,
    findUnlinkedMentions,
    linkMentions
} from '../unlinked-mentions'

const target = {
    path: 'target',
    title: 'Project Alpha',
    properties: { aliases: ['Alpha'] }
}

const buildNote = (path, text) => ({ path, title: path, note: text })

describe('find unlinked mentions', () => {
    test('returns notes that mention the title in plain text', () => {
        const notes = [target, buildNote('a', 'Working on project alpha today')]

        expect(findUnlinkedMentions(target, notes).map((note) => note.path)).toEqual(['a'])
    })

    test('matches aliases', () => {
        const notes = [target, buildNote('a', 'Alpha is late')]

        expect(findUnlinkedMentions(target, notes).map((note) => note.path)).toEqual(['a'])
    })

    test('skips notes that already link to the target', () => {
        const notes = [target, buildNote('a', 'See [[Project Alpha]] and Project Alpha again')]

        expect(findUnlinkedMentions(target, notes)).toEqual([])
    })

    test('skips mentions inside links, code and tags', () => {
        const notes = [
            target,
            buildNote('a', '[[Other|Alpha]] and [Alpha](https://x.dev)'),
            buildNote('b', 'Run `Alpha` now\n\n```\nProject Alpha\n```'),
            buildNote('c', 'Filed under #Alpha')
        ]

        expect(findUnlinkedMentions(target, notes)).toEqual([])
    })

    test('skips partial word matches', () => {
        const notes = [target, buildNote('a', 'Alphabet and Alphas')]

        expect(findUnlinkedMentions(target, notes)).toEqual([])
    })

    test('matches names with accents at word boundaries', () => {
        const accented = { path: 'target', title: 'Canción' }
        const notes = [accented, buildNote('a', 'La canción favorita'), buildNote('b', 'Canciones')]

        expect(findUnlinkedMentions(accented, notes).map((note) => note.path)).toEqual(['a'])
    })

    test('ignores the target note itself', () => {
        const notes = [{ ...target, note: 'Project Alpha notes' }]

        expect(findUnlinkedMentions(target, notes)).toEqual([])
    })
})

describe('link mentions', () => {
    test('wraps an exact title match in a wiki link', () => {
        expect(linkMentions('About Project Alpha.', target)).toBe('About [[Project Alpha]].')
    })

    test('keeps the original text as alias when the match differs', () => {
        expect(linkMentions('About project alpha and Alpha.', target)).toBe(
            'About [[Project Alpha|project alpha]] and [[Project Alpha|Alpha]].'
        )
    })

    test('leaves existing links and code untouched', () => {
        const text = '[[Project Alpha]] `Alpha` Alpha'

        expect(linkMentions(text, target)).toBe('[[Project Alpha]] `Alpha` [[Project Alpha|Alpha]]')
    })
})

describe('build unlinked mentions html', () => {
    test('returns an empty string when there are no mentions', () => {
        expect(buildUnlinkedMentionsHtml([], 'Mentions', 'Link')).toBe('')
    })

    test('renders an open link and a link action per note', () => {
        const result = buildUnlinkedMentionsHtml(
            [{ path: 'a b', title: '<Note>' }],
            'Mentions',
            'Link'
        )

        expect(result).toContain('href="wikilink://a%20b"')
        expect(result).toContain('href="linkmention://a%20b"')
        expect(result).toContain('&lt;Note&gt;')
        expect(result).toContain('>Link<')
    })
})
