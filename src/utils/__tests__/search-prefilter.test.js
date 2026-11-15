import { buildPrefilter, compilePrefilter } from '../search-prefilter'
import { filterNotes } from '../search-filter'
import { parseSearchQuery } from '../search-parser'
import { getNoteTags } from '../note-tags'
import { getSearchText } from '../search-text'
import { matchesTag } from '../tag-names'
import { MOCK_NOTE_PATHS, MOCK_SEARCH_NOTES } from '../__fixtures__/search-query'

const NOTES = [
    ...MOCK_SEARCH_NOTES,
    {
        path: 'note-4',
        title: 'Canción de cuna',
        filename: 'Canción de cuna.md',
        tags: ['música/infantil'],
        properties: {},
        note: 'Duérmete niño, la CANCIÓN termina aquí\n\n- [ ] grabar la canción',
        updatedAt: 1
    },
    {
        path: 'note-5',
        title: 'Release plan',
        filename: 'Release plan.md',
        tags: ['work/release'],
        properties: { status: 'open' },
        rawFrontmatter: 'status: open\nowner: Marta',
        note: 'Ship the build on Friday.\nOwner reviews the Marta checklist',
        updatedAt: 2
    }
]

const PATHS = new Map([...MOCK_NOTE_PATHS, ['note-4', 'Home'], ['note-5', 'Work/Meetings']])
const FOLDERS = new Set([...PATHS.values()].map((folder) => folder.toLowerCase()))

const fts = (columns, term, note) => {
    const needle = term.toLowerCase()
    const fields = { title: note.title, content: getSearchText(note) }

    return columns.some((column) => fields[column].toLowerCase().includes(needle))
}

const matches = (tree, note) => {
    if (tree.kind === 'fts') return fts(tree.columns, tree.term, note)
    if (tree.kind === 'tag') return getNoteTags(note).some((tag) => matchesTag(tag, tree.name))
    if (tree.kind === 'and') return tree.children.every((child) => matches(child, note))

    return tree.children.some((child) => matches(child, note))
}

const QUERIES = [
    'agenda',
    'agenda tasks',
    '"happy cat"',
    'agenda OR milk',
    'agenda OR (milk eggs)',
    'agenda -milk',
    '-agenda',
    'tag:work',
    'tag:home/shopping',
    'tag:música',
    'tag:work milk',
    'file:grocery',
    'file:list.md',
    'path:meetings',
    'path:grocery',
    'content:agenda',
    'content:marta',
    'marta',
    'owner',
    'match-case:Agenda',
    'ignore-case:AGENDA',
    'line:agenda',
    'section:tasks',
    'task-todo:call',
    'task-done:email',
    'task:ana',
    '/agen.a/',
    '[status:draft]',
    'has:images',
    'canción',
    'CANCIÓN',
    'cancion',
    'work',
    'meetings',
    'md',
    'ag',
    'list.md',
    'standup grocery',
    'grocery OR standup OR cuna',
    'is:pinned'
]

describe('search prefilter', () => {
    test.each(QUERIES)('keeps every note that the full scan finds for "%s"', (query) => {
        const ast = parseSearchQuery(query)
        const tree = buildPrefilter(ast, FOLDERS)
        const context = { pinned: new Set(), notePaths: PATHS, matchCase: false }
        const found = filterNotes(NOTES, ast, context)

        if (!tree) return

        const candidates = NOTES.filter((note) => matches(tree, note))
        found.forEach((note) => expect(candidates).toContain(note))
    })

    test('requires the term in the title or the content for a plain word', () => {
        const tree = buildPrefilter(parseSearchQuery('agenda'), FOLDERS)

        expect(tree).toEqual({ kind: 'fts', columns: ['title', 'content'], term: 'agenda' })
    })

    test('does not filter terms shorter than three characters', () => {
        expect(buildPrefilter(parseSearchQuery('ag'), FOLDERS)).toBeNull()
    })

    test('does not filter terms that could match the extension or the folder separator', () => {
        expect(buildPrefilter(parseSearchQuery('list.md'), FOLDERS)).toBeNull()
        expect(buildPrefilter(parseSearchQuery('work/meet'), FOLDERS)).toBeNull()
    })

    test('does not filter a term that appears in a folder path', () => {
        expect(buildPrefilter(parseSearchQuery('meetings'), FOLDERS)).toBeNull()
    })

    test('does not filter negations, regular expressions or properties', () => {
        expect(buildPrefilter(parseSearchQuery('-agenda'), FOLDERS)).toBeNull()
        expect(buildPrefilter(parseSearchQuery('/agen.a/'), FOLDERS)).toBeNull()
        expect(buildPrefilter(parseSearchQuery('[status:draft]'), FOLDERS)).toBeNull()
    })

    test('filters only the filterable side of an and and drops the rest', () => {
        const tree = buildPrefilter(parseSearchQuery('agenda -milk'), FOLDERS)

        expect(tree).toEqual({ kind: 'fts', columns: ['title', 'content'], term: 'agenda' })
    })

    test('gives up on an or when one branch cannot be filtered', () => {
        expect(buildPrefilter(parseSearchQuery('agenda OR ag'), FOLDERS)).toBeNull()
    })

    test('does not filter terms whose lowercase form changes the length', () => {
        expect(buildPrefilter(parseSearchQuery('İstanbul'), FOLDERS)).toBeNull()
    })

    test('searches only the content column for a content operator', () => {
        const tree = buildPrefilter(parseSearchQuery('content:marta'), FOLDERS)

        expect(tree).toEqual({ kind: 'fts', columns: ['content'], term: 'marta' })
    })

    test('uses a tag leaf for a tag operator and skips non ascii tags', () => {
        expect(buildPrefilter(parseSearchQuery('tag:#Work'), FOLDERS)).toEqual({ kind: 'tag', name: 'work' })
        expect(buildPrefilter(parseSearchQuery('tag:música'), FOLDERS)).toBeNull()
    })
})

describe('search prefilter sql', () => {
    test('compiles a single term into a notes lookup with a limit placeholder', () => {
        const { sql, params } = compilePrefilter({ kind: 'fts', columns: ['title', 'content'], term: 'agenda' })

        expect(sql).toContain('note_fts MATCH ?')
        expect(sql.endsWith('LIMIT ?')).toBe(true)
        expect(params).toEqual(['{title content} : "agenda"'])
    })

    test('escapes double quotes inside a term', () => {
        const { params } = compilePrefilter({ kind: 'fts', columns: ['content'], term: 'say "hi"' })

        expect(params).toEqual(['{content} : "say ""hi"""'])
    })

    test('merges text terms into one match expression with and and or', () => {
        const tree = {
            kind: 'and',
            children: [
                { kind: 'fts', columns: ['content'], term: 'one' },
                {
                    kind: 'or',
                    children: [
                        { kind: 'fts', columns: ['title'], term: 'two' },
                        { kind: 'fts', columns: ['content'], term: 'three' }
                    ]
                }
            ]
        }

        const { sql, params } = compilePrefilter(tree)

        expect(sql).not.toContain('INTERSECT')
        expect(params).toEqual(['({content} : "one" AND ({title} : "two" OR {content} : "three"))'])
    })

    test('joins an and with intersect and an or with union keeping the parameter order', () => {
        const tree = {
            kind: 'and',
            children: [
                { kind: 'fts', columns: ['content'], term: 'one' },
                {
                    kind: 'or',
                    children: [
                        { kind: 'tag', name: 'work' },
                        { kind: 'fts', columns: ['title'], term: 'two' }
                    ]
                }
            ]
        }

        const { sql, params } = compilePrefilter(tree)

        expect(sql).toContain(' INTERSECT ')
        expect(sql).toContain(' UNION ')
        expect(params).toEqual(['{content} : "one"', 'work', 'work/%', '{title} : "two"'])
    })

    test('escapes like wildcards in a tag name', () => {
        const { params } = compilePrefilter({ kind: 'tag', name: 'a_b%' })

        expect(params).toEqual(['a_b%', 'a\\_b\\%/%'])
    })
})
