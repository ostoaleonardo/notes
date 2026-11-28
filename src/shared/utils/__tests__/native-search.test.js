import { createNativeCursor, createNativeSearch, toNativeNode } from '../native-search'
import { parseSearchQuery } from '../search-parser'

const note = (folderId, filename) => ({ folderId, filename, path: `${folderId}::${filename}` })

const NOTES = [note('a', 'one.md'), note('a', 'two.md'), note('b', 'three.md')]
const FOLDER_PATH_BY_NOTE = new Map([
    ['a::one.md', 'Work'],
    ['a::two.md', 'Work'],
    ['b::three.md', '']
])

const createFs = (steps, id = 7) => ({
    searchOpen: jest.fn().mockResolvedValue(id),
    searchStep: jest.fn().mockImplementation(async () => steps.shift()),
    searchClose: jest.fn()
})

const step = (matches, done) => ({
    folderIds: matches.map(([folderId]) => folderId),
    filenames: matches.map(([, filename]) => filename),
    done
})

describe('native search query', () => {
    test('keeps only what the core needs of each node', () => {
        const ast = parseSearchQuery('"a b" -tag:work /x.y/ [status:>1] [aliases:null] file:note')

        const json = JSON.stringify(toNativeNode(ast))

        expect(json).not.toContain('regexes')
        expect(json).not.toContain('"raw"')
        expect(JSON.parse(json).children).toEqual([
            { type: 'text', value: 'a b', phrase: true },
            { type: 'not', child: { type: 'filter', name: 'tag', argument: { type: 'text', value: 'work', phrase: false } } },
            { type: 'regex', pattern: 'x.y' },
            {
                type: 'property',
                key: 'status',
                expression: { type: 'and', children: [{ type: 'compare', operator: '>', value: '1' }] }
            },
            {
                type: 'property',
                key: 'aliases',
                expression: { type: 'and', children: [{ type: 'null' }] }
            },
            { type: 'filter', name: 'file', argument: { type: 'text', value: 'note', phrase: false } }
        ])
    })

    test('keeps the alternatives of an or', () => {
        const [node] = toNativeNode(parseSearchQuery('a OR b')).children

        expect(node).toEqual({
            type: 'or',
            children: [
                { type: 'text', value: 'a', phrase: false },
                { type: 'text', value: 'b', phrase: false }
            ]
        })
    })
})

describe('native search without the native functions', () => {
    test('opens nothing and warms nothing', async () => {
        const search = createNativeSearch({})

        expect(await search.open({
            ast: parseSearchQuery('milk'),
            notes: NOTES,
            folderPathByNote: FOLDER_PATH_BY_NOTE,
            pinned: new Set(),
            matchCase: false,
            sort: 'name-asc',
            isCancelled: () => false
        })).toBeNull()
        await expect(search.warm(NOTES)).resolves.toBeUndefined()
    })
})

describe('warm native search', () => {
    test('asks the core to read the notes of every folder once', async () => {
        const fs = { searchOpen: jest.fn(), searchWarm: jest.fn().mockResolvedValue(undefined) }

        await createNativeSearch(fs).warm(NOTES)

        expect(fs.searchWarm).toHaveBeenCalledWith(['a', 'b'])
    })
})

describe('open native search', () => {
    const open = (fs, overrides = {}) => createNativeSearch(fs, { size: 2 }).open({
        ast: parseSearchQuery('milk'),
        notes: NOTES,
        folderPathByNote: FOLDER_PATH_BY_NOTE,
        pinned: new Set(['a::one.md']),
        matchCase: true,
        sort: 'name-asc',
        isCancelled: () => false,
        ...overrides
    })

    const sentRequest = (fs) => JSON.parse(fs.searchOpen.mock.calls[0][0])

    test('sends one request with the query, the folders and their paths, and what is pinned', async () => {
        const fs = createFs([])

        await open(fs)

        expect(sentRequest(fs)).toEqual({
            query: {
                type: 'and',
                children: [{ type: 'text', value: 'milk', phrase: false }]
            },
            sort: 'name-asc',
            folderIds: ['a', 'b'],
            folderPathById: { a: 'Work', b: '' },
            pinned: ['a::one.md'],
            matchCase: true,
            unindexed: []
        })
    })

    test('sends the notes the index does not know yet with what the app knows of them', async () => {
        const fs = createFs([])
        const fresh = {
            ...note('a', 'fresh.md'),
            fileUri: 'file:///repo/fresh.md',
            title: 'Fresh',
            updatedAt: 42,
            tags: ['new'],
            properties: { status: 'open' }
        }
        const isIndexed = (candidate) => candidate !== fresh

        await createNativeSearch(fs, { size: 2, isIndexed }).open({
            ast: parseSearchQuery('milk'),
            notes: [...NOTES, fresh],
            folderPathByNote: FOLDER_PATH_BY_NOTE,
            pinned: new Set(),
            matchCase: false,
            sort: 'name-asc',
            isCancelled: () => false
        })

        expect(sentRequest(fs).unindexed).toEqual([{
            folderId: 'a',
            filename: 'fresh.md',
            location: 'file:///repo/fresh.md',
            title: 'Fresh',
            modified: 42,
            tags: ['new'],
            properties: { status: 'open' }
        }])
    })

    test('answers nothing when the core cannot evaluate the query', async () => {
        const fs = createFs([])
        fs.searchOpen.mockResolvedValue(null)

        expect(await open(fs)).toBeNull()
    })

    test('turns the matched names back into notes, page by page', async () => {
        const fs = createFs([
            step([['a', 'one.md']], false),
            step([['a', 'two.md'], ['b', 'three.md']], true)
        ])
        const cursor = await open(fs)
        const progress = jest.fn()

        const first = await cursor.next(1, progress)
        const second = await cursor.next(5, progress)

        expect(first).toEqual({ found: [NOTES[0]], done: false })
        expect(second).toEqual({ found: [NOTES[1], NOTES[2]], done: true })
        expect(fs.searchStep).toHaveBeenCalledWith(7, 2)
        expect(progress).toHaveBeenCalledTimes(2)
    })

    test('keeps the matches it did not hand out yet for the next page', async () => {
        const fs = createFs([step([['a', 'one.md'], ['a', 'two.md'], ['b', 'three.md']], true)])
        const cursor = await open(fs)

        const first = await cursor.next(2)
        const second = await cursor.next(2)

        expect(first).toEqual({ found: [NOTES[0], NOTES[1]], done: false })
        expect(second).toEqual({ found: [NOTES[2]], done: true })
        expect(fs.searchStep).toHaveBeenCalledTimes(1)
    })

    test('ignores matches for notes the app does not have', async () => {
        const fs = createFs([step([['z', 'ghost.md'], ['a', 'one.md']], true)])
        const cursor = await open(fs)

        expect(await cursor.next(5)).toEqual({ found: [NOTES[0]], done: true })
    })

    test('closes the search it opened', async () => {
        const fs = createFs([])
        const cursor = await open(fs)

        cursor.close()

        expect(fs.searchClose).toHaveBeenCalledWith(7)
    })
})

describe('native search cursor', () => {
    test('stops without a result once it is cancelled', async () => {
        let cancelled = false
        const fs = createFs([step([['a', 'one.md']], false)])
        fs.searchStep.mockImplementation(async () => {
            cancelled = true
            return step([['a', 'one.md']], false)
        })

        const cursor = createNativeCursor({
            fs,
            id: 1,
            notesByPath: new Map(NOTES.map((entry) => [entry.path, entry])),
            size: 10,
            isCancelled: () => cancelled
        })

        expect(await cursor.next(5)).toBeNull()
    })
})
