import {
    parseSearchQuery,
    toggleTagQualifier,
    togglePinnedQualifier,
    toggleImageQualifier,
    toggleContentQualifier
} from '../search-query'
import { filterNotes } from '../search-filter'
import { MOCK_SEARCH_NOTES } from '../__fixtures__/search-query'

const parsedWith = (overrides) => ({
    text: '',
    phrases: [],
    regexes: [],
    orGroups: [],
    tags: [],
    excludedTags: [],
    paths: [],
    excludedPaths: [],
    files: [],
    excludedFiles: [],
    pinned: false,
    notPinned: false,
    hasImage: false,
    noImage: false,
    inContent: false,
    modified: null,
    created: null,
    lines: [],
    properties: [],
    excludedTerms: [],
    excludedRegexes: [],
    ...overrides
})

describe('parse search query', () => {
    test('extracts plain text', () => {
        expect(parseSearchQuery('Groceries')).toEqual(parsedWith({ text: 'groceries' }))
    })

    test('extracts a bare tag qualifier', () => {
        expect(parseSearchQuery('tag:work meeting')).toEqual(
            parsedWith({ text: 'meeting', tags: ['work'] })
        )
    })

    test('extracts a quoted tag qualifier with spaces', () => {
        expect(parseSearchQuery('tag:"personal notes" ideas')).toEqual(
            parsedWith({ text: 'ideas', tags: ['personal notes'] })
        )
    })

    test('extracts more than one tag qualifier', () => {
        expect(parseSearchQuery('tag:work tag:personal standup')).toEqual(
            parsedWith({ text: 'standup', tags: ['work', 'personal'] })
        )
    })

    test('extracts the pinned qualifier', () => {
        expect(parseSearchQuery('is:pinned todo')).toEqual(
            parsedWith({ text: 'todo', pinned: true })
        )
    })

    test('combines pinned and tag qualifiers with text', () => {
        expect(parseSearchQuery('is:pinned tag:work standup')).toEqual(
            parsedWith({ text: 'standup', tags: ['work'], pinned: true })
        )
    })

    test('extracts the has:image qualifier', () => {
        expect(parseSearchQuery('has:image recipe')).toEqual(
            parsedWith({ text: 'recipe', hasImage: true })
        )
    })

    test('extracts the in:content qualifier', () => {
        expect(parseSearchQuery('in:content recipe')).toEqual(
            parsedWith({ text: 'recipe', inContent: true })
        )
    })

    test('extracts the modified: date qualifier', () => {
        expect(parseSearchQuery('modified:2026-01-15 report')).toEqual(
            parsedWith({ text: 'report', modified: { from: '2026-01-15', to: '2026-01-15' } })
        )
    })

    test('extracts the created: date qualifier', () => {
        expect(parseSearchQuery('created:2026-01-01')).toEqual(
            parsedWith({ created: { from: '2026-01-01', to: '2026-01-01' } })
        )
    })

    test('extracts a date range', () => {
        expect(parseSearchQuery('modified:2026-01-01..2026-01-31').modified).toEqual({
            from: '2026-01-01',
            to: '2026-01-31'
        })
    })

    test('extracts open ended date comparisons', () => {
        expect(parseSearchQuery('modified:>2026-01-01').modified).toEqual({
            from: '2026-01-02',
            to: null
        })
        expect(parseSearchQuery('created:<=2026-01-10').created).toEqual({
            from: null,
            to: '2026-01-10'
        })
    })

    test('treats an invalid date as plain text', () => {
        expect(parseSearchQuery('modified:soon').text).toBe('modified:soon')
    })

    test('extracts negated qualifiers', () => {
        const result = parseSearchQuery('-tag:work -path:old -file:draft -is:pinned -has:image')

        expect(result).toEqual(parsedWith({
            excludedTags: ['work'],
            excludedPaths: ['old'],
            excludedFiles: ['draft'],
            notPinned: true,
            noImage: true
        }))
    })

    test('extracts phrases, negated words and regular expressions', () => {
        const result = parseSearchQuery('"exact phrase" -draft -"old idea" /te+st/ -/tmp\\d/')

        expect(result.phrases).toEqual(['exact phrase'])
        expect(result.excludedTerms).toEqual(['draft', 'old idea'])
        expect(result.regexes).toEqual([/te+st/i])
        expect(result.excludedRegexes).toEqual([/tmp\d/i])
    })

    test('treats an invalid regular expression as plain text', () => {
        expect(parseSearchQuery('/(/').text).toBe('/(/')
    })

    test('splits alternatives on OR', () => {
        const result = parseSearchQuery('apples oranges OR pears')

        expect(result.text).toBe('apples oranges')
        expect(result.orGroups).toEqual([{ text: 'pears', phrases: [], regexes: [] }])
    })

    test('extracts line and task operators', () => {
        const result = parseSearchQuery('line:(milk eggs) task-todo:(call) task:"x"')

        expect(result.lines).toEqual([
            { kind: 'line', terms: ['milk', 'eggs'] },
            { kind: 'task-todo', terms: ['call'] },
            { kind: 'task', terms: ['x'] }
        ])
    })

    test('extracts property queries', () => {
        const result = parseSearchQuery('[status:done] [author] -[draft:true]')

        expect(result.properties).toEqual([
            { key: 'status', value: 'done', negate: false },
            { key: 'author', value: null, negate: false },
            { key: 'draft', value: 'true', negate: true }
        ])
    })
})

describe('toggle tag qualifier', () => {
    test('adds a tag qualifier to an empty query', () => {
        expect(toggleTagQualifier('', 'work')).toBe('tag:work')
    })

    test('quotes a tag name containing spaces', () => {
        expect(toggleTagQualifier('', 'personal notes')).toBe('tag:"personal notes"')
    })

    test('removes the qualifier when the same tag is toggled again', () => {
        expect(toggleTagQualifier('meeting tag:work', 'work')).toBe('meeting')
    })

    test('adds a second tag qualifier alongside an existing one', () => {
        expect(toggleTagQualifier('meeting tag:work', 'personal')).toBe(
            'meeting tag:work tag:personal'
        )
    })

    test('removes only the toggled tag, keeping other selected tags', () => {
        expect(toggleTagQualifier('meeting tag:work tag:personal', 'work')).toBe(
            'meeting tag:personal'
        )
    })
})

describe('toggle pinned qualifier', () => {
    test('adds the pinned qualifier to an empty query', () => {
        expect(togglePinnedQualifier('')).toBe('is:pinned')
    })

    test('appends the pinned qualifier to existing text', () => {
        expect(togglePinnedQualifier('todo')).toBe('todo is:pinned')
    })

    test('removes the pinned qualifier when already present', () => {
        expect(togglePinnedQualifier('todo is:pinned')).toBe('todo')
    })
})

describe('toggle image qualifier', () => {
    test('adds the has:image qualifier to an empty query', () => {
        expect(toggleImageQualifier('')).toBe('has:image')
    })

    test('appends the has:image qualifier to existing text', () => {
        expect(toggleImageQualifier('recipe')).toBe('recipe has:image')
    })

    test('removes the has:image qualifier when already present', () => {
        expect(toggleImageQualifier('recipe has:image')).toBe('recipe')
    })
})

describe('toggle content qualifier', () => {
    test('adds the in:content qualifier to an empty query', () => {
        expect(toggleContentQualifier('')).toBe('in:content')
    })

    test('appends the in:content qualifier to existing text', () => {
        expect(toggleContentQualifier('recipe')).toBe('recipe in:content')
    })

    test('removes the in:content qualifier when already present', () => {
        expect(toggleContentQualifier('recipe in:content')).toBe('recipe')
    })
})

describe('parse path, file and hashed tag qualifiers', () => {
    test('extracts path and file qualifiers', () => {
        const result = parseSearchQuery('path:work/ideas file:"my note" plan')

        expect(result.paths).toEqual(['work/ideas'])
        expect(result.files).toEqual(['my note'])
        expect(result.text).toBe('plan')
    })

    test('ignores the leading hash of a tag qualifier', () => {
        expect(parseSearchQuery('tag:#work').tags).toEqual(['work'])
    })
})

describe('filter notes', () => {
    test('filters by title text', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery('grocery'), options)
        expect(result.map((note) => note.path)).toEqual(['note-2'])
    })

    test('fuzzy-matches a non-contiguous title query', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery('wkstandup'), options)
        expect(result.map((note) => note.path)).toEqual(['note-1'])
    })

    test('ignores note body text by default', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery('agenda'), options)
        expect(result).toHaveLength(0)
    })

    test('matches note body text when in:content is set', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(
            MOCK_SEARCH_NOTES,
            parseSearchQuery('in:content agenda'),
            options
        )
        expect(result.map((note) => note.path)).toEqual(['note-1'])
    })

    test('still matches by title when in:content is set', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(
            MOCK_SEARCH_NOTES,
            parseSearchQuery('in:content grocery'),
            options
        )
        expect(result.map((note) => note.path)).toEqual(['note-2'])
    })

    test('filters by tag qualifier', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery('tag:work'), options)
        expect(result.map((note) => note.path)).toEqual(['note-1'])
    })

    test('filters by more than one tag qualifier, matching any of them', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(
            MOCK_SEARCH_NOTES,
            parseSearchQuery('tag:work tag:personal'),
            options
        )
        expect(result.map((note) => note.path).sort()).toEqual(['note-1', 'note-2'])
    })

    test('matches nested tags when filtering by their parent', () => {
        const notes = [
            { path: 'a', title: 'A', tags: ['work/projects'] },
            { path: 'b', title: 'B', tags: ['workshop'] },
            { path: 'c', title: 'C', tags: [], note: 'text #work/todo' }
        ]
        const result = filterNotes(notes, parseSearchQuery('tag:work'), { pinned: new Set() })
        expect(result.map((note) => note.path)).toEqual(['a', 'c'])
    })

    test('filters by pinned qualifier', () => {
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery('is:pinned'), {
            pinned: new Set(['note-3'])
        })
        expect(result.map((note) => note.path)).toEqual(['note-3'])
    })

    test('combines pinned, tag and text qualifiers', () => {
        const result = filterNotes(
            MOCK_SEARCH_NOTES,
            parseSearchQuery('is:pinned tag:work standup'),
            { pinned: new Set(['note-1']) }
        )
        expect(result.map((note) => note.path)).toEqual(['note-1'])
    })

    test('returns every note for an empty query', () => {
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery(''), { pinned: new Set() })
        expect(result).toHaveLength(3)
    })

    test('filters by has:image qualifier', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(MOCK_SEARCH_NOTES, parseSearchQuery('has:image'), options)
        expect(result.map((note) => note.path)).toEqual(['note-2'])
    })

    test('filters by modified: date qualifier', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(
            MOCK_SEARCH_NOTES,
            parseSearchQuery('modified:2026-01-05'),
            options
        )
        expect(result.map((note) => note.path)).toEqual(['note-1'])
    })

    test('filters by created: date qualifier', () => {
        const options = { pinned: new Set() }
        const result = filterNotes(
            MOCK_SEARCH_NOTES,
            parseSearchQuery('created:2026-01-02'),
            options
        )
        expect(result.map((note) => note.path)).toEqual(['note-2'])
    })

    describe('by path and file', () => {
        const notes = [
            { path: 'r1::a.md', filename: 'a.md', title: 'a' },
            { path: 'r2::b.md', filename: 'b.md', title: 'b' },
            { path: 'r2::plan.md', filename: 'plan.md', title: 'plan' }
        ]
        const notePaths = new Map(
            [['r1::a.md', ''], ['r2::b.md', 'Work/Ideas'], ['r2::plan.md', 'Work/Ideas']]
        )
        const options = { pinned: new Set(), notePaths }

        test('filters by folder path', () => {
            const result = filterNotes(notes, parseSearchQuery('path:work/ideas'), options)
            expect(result.map((note) => note.path)).toEqual(['r2::b.md', 'r2::plan.md'])
        })

        test('filters by file name', () => {
            const result = filterNotes(notes, parseSearchQuery('file:plan'), options)
            expect(result.map((note) => note.path)).toEqual(['r2::plan.md'])
        })

        test('combines path and file qualifiers', () => {
            const result = filterNotes(notes, parseSearchQuery('path:work file:b.md'), options)
            expect(result.map((note) => note.path)).toEqual(['r2::b.md'])
        })
    })
})

describe('filter notes with advanced operators', () => {
    const notes = [
        {
            path: 'a',
            title: 'Alpha plan',
            filename: 'alpha.md',
            tags: ['work'],
            note: 'milk and eggs\n- [ ] call mom\n- [x] pay rent\n- [/] write report',
            properties: { status: 'done', authors: ['Ann', 'Bob'] },
            updatedAt: new Date('2026-01-10T10:00:00Z').getTime(),
            createdAt: new Date('2026-01-01T10:00:00Z').getTime()
        },
        {
            path: 'b',
            title: 'Beta draft',
            filename: 'beta.md',
            tags: [],
            note: 'bread\nmilk',
            properties: { status: 'todo', rating: 5 },
            updatedAt: new Date('2026-02-10T10:00:00Z').getTime(),
            createdAt: new Date('2026-02-01T10:00:00Z').getTime()
        },
        {
            path: 'c',
            title: 'Gamma',
            filename: 'gamma.md',
            tags: ['work'],
            note: 'plain text',
            updatedAt: new Date('2026-03-10T10:00:00Z').getTime(),
            createdAt: new Date('2026-03-01T10:00:00Z').getTime()
        }
    ]
    const options = { pinned: new Set(['a']) }
    const run = (query) => (
        filterNotes(notes, parseSearchQuery(query), options).map((note) => note.path)
    )

    test('excludes notes with a negated tag', () => {
        expect(run('-tag:work')).toEqual(['b'])
    })

    test('excludes pinned notes with a negated pinned qualifier', () => {
        expect(run('-is:pinned')).toEqual(['b', 'c'])
    })

    test('excludes notes whose title contains a negated word', () => {
        expect(run('-draft')).toEqual(['a', 'c'])
    })

    test('searches negated words in the body when in:content is set', () => {
        expect(run('in:content -milk')).toEqual(['c'])
    })

    test('matches an exact phrase instead of fuzzy matching', () => {
        expect(run('"alpha plan"')).toEqual(['a'])
        expect(run('"alpha pln"')).toEqual([])
    })

    test('matches a regular expression against titles', () => {
        expect(run('/^(alpha|gamma)/')).toEqual(['a', 'c'])
    })

    test('matches a regular expression against the body with in:content', () => {
        expect(run('in:content /pl\\w+ text/')).toEqual(['c'])
    })

    test('matches any alternative separated by OR', () => {
        expect(run('alpha OR gamma')).toEqual(['a', 'c'])
    })

    test('keeps words of one alternative together', () => {
        expect(run('in:content milk and OR plain')).toEqual(['a', 'c'])
    })

    test('filters by a date range', () => {
        expect(run('modified:2026-01-01..2026-02-28')).toEqual(['a', 'b'])
        expect(run('created:>2026-02-01')).toEqual(['c'])
        expect(run('modified:<2026-02-10')).toEqual(['a'])
    })

    test('finds terms that share a line', () => {
        expect(run('line:(milk eggs)')).toEqual(['a'])
        expect(run('line:(bread milk)')).toEqual([])
    })

    test('filters tasks by status', () => {
        expect(run('task:(mom)')).toEqual(['a'])
        expect(run('task-todo:(mom)')).toEqual(['a'])
        expect(run('task-done:(mom)')).toEqual([])
        expect(run('task-done:(rent)')).toEqual(['a'])
        expect(run('task:(report)')).toEqual(['a'])
        expect(run('task-todo:(report)')).toEqual([])
    })

    test('does not treat plain lines as tasks', () => {
        expect(run('task:(milk)')).toEqual([])
    })

    test('filters by property value and presence', () => {
        expect(run('[status:done]')).toEqual(['a'])
        expect(run('[rating]')).toEqual(['b'])
        expect(run('[rating:5]')).toEqual(['b'])
        expect(run('[authors:bob]')).toEqual(['a'])
        expect(run('-[status]')).toEqual(['c'])
    })
})
