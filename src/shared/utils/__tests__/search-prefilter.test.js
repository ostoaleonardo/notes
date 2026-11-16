import { buildPrefilter, compileMatchIds, compilePage } from '../search-prefilter'
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
    test('compiles a single term into a match subquery', () => {
        const { sql, params } = compileMatchIds({ kind: 'fts', columns: ['title', 'content'], term: 'agenda' })

        expect(sql).toContain('note_fts MATCH ?')
        expect(params).toEqual(['{title content} : "agenda"'])
    })

    test('escapes double quotes inside a term', () => {
        const { params } = compileMatchIds({ kind: 'fts', columns: ['content'], term: 'say "hi"' })

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

        const { sql, params } = compileMatchIds(tree)

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

        const { sql, params } = compileMatchIds(tree)

        expect(sql).toContain(' INTERSECT ')
        expect(sql).toContain(' UNION ')
        expect(params).toEqual(['{content} : "one"', 'work', 'work/%', '{title} : "two"'])
    })

    test('escapes like wildcards in a tag name', () => {
        const { params } = compileMatchIds({ kind: 'tag', name: 'a_b%' })

        expect(params).toEqual(['a_b%', 'a\\_b\\%/%'])
    })
})

describe('search page sql', () => {
    const TREE = { kind: 'fts', columns: ['content'], term: 'agenda' }

    test('pages every note by name when there is no filter and no cursor', () => {
        const { sql, params } = compilePage({ tree: null, sort: 'name-asc', cursor: null, size: 50 })

        expect(sql).toContain('FROM notes n ORDER BY n.sort_key ASC, n.id ASC LIMIT ?')
        expect(sql).not.toContain('WHERE')
        expect(params).toEqual([50])
    })

    test('restricts the page to the notes that match the filter', () => {
        const { sql, params } = compilePage({ tree: TREE, sort: 'name-asc', cursor: null, size: 20 })

        expect(sql).toContain('WHERE n.id IN (')
        expect(params).toEqual(['{content} : "agenda"', 20])
    })

    test('continues after the cursor with a keyset condition for an ascending name order', () => {
        const cursor = { sortKey: 'key', id: 7 }
        const { sql, params } = compilePage({ tree: null, sort: 'name-asc', cursor, size: 10 })

        expect(sql).toContain('WHERE ((n.sort_key > ?) OR (n.sort_key = ? AND n.id > ?))')
        expect(params).toEqual(['key', 'key', 7, 10])
    })

    test('reverses the comparison for a descending name order', () => {
        const cursor = { sortKey: 'key', id: 7 }
        const { sql } = compilePage({ tree: null, sort: 'name-desc', cursor, size: 10 })

        expect(sql).toContain('n.sort_key < ?')
        expect(sql).toContain('ORDER BY n.sort_key DESC, n.id DESC')
    })

    test('orders by modified time then by name with a three level keyset', () => {
        const cursor = { sortKey: 'key', modified: 500, id: 7 }
        const { sql, params } = compilePage({ tree: null, sort: 'modified-desc', cursor, size: 10 })

        expect(sql).toContain('ORDER BY n.modified DESC, n.sort_key ASC, n.id ASC')
        expect(sql).toContain('(n.modified < ?)')
        expect(sql).toContain('(n.modified = ? AND n.sort_key > ?)')
        expect(sql).toContain('(n.modified = ? AND n.sort_key = ? AND n.id > ?)')
        expect(params).toEqual([500, 500, 'key', 500, 'key', 7, 10])
    })

    test('uses the modified column for the created orders', () => {
        const { sql } = compilePage({ tree: null, sort: 'created-asc', cursor: null, size: 10 })

        expect(sql).toContain('ORDER BY n.modified ASC, n.sort_key ASC, n.id ASC')
    })

    test('falls back to the name order for an unknown sort', () => {
        const { sql } = compilePage({ tree: null, sort: 'other', cursor: null, size: 10 })

        expect(sql).toContain('ORDER BY n.sort_key ASC, n.id ASC')
    })

    test('keeps the filter parameters before the cursor and the size', () => {
        const cursor = { sortKey: 'key', id: 3 }
        const { params } = compilePage({ tree: TREE, sort: 'name-asc', cursor, size: 5 })

        expect(params).toEqual(['{content} : "agenda"', 'key', 'key', 3, 5])
    })
})
