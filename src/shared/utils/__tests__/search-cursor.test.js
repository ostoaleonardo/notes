import { createMemorySource, createSearchCursor } from '../search-cursor'
import { parseSearchQuery } from '../search-parser'

const buildNote = (title, text = '') => ({
    path: `repo::${title}.md`,
    filename: `${title}.md`,
    title,
    note: text,
    updatedAt: 1
})

const NOTES = ['delta', 'alpha', 'charlie', 'bravo'].map((title) => buildNote(title, 'match'))
const CONTEXT = { pinned: new Set(), notePaths: new Map(), matchCase: false }
const AST = parseSearchQuery('match')
const noYield = async () => {}

const drain = async (source) => {
    const batches = []
    let batch = await source.nextBatch()

    while (batch) {
        batches.push(batch.map((note) => note.title))
        batch = await source.nextBatch()
    }

    return batches
}

describe('memory search source', () => {
    test('returns the notes sorted by name in batches', async () => {
        const source = createMemorySource(NOTES, 'name-asc', 2)

        expect(await drain(source)).toEqual([['alpha', 'bravo'], ['charlie', 'delta']])
    })

    test('sorts in the requested direction', async () => {
        const source = createMemorySource(NOTES, 'name-desc', 3)

        expect(await drain(source)).toEqual([['delta', 'charlie', 'bravo'], ['alpha']])
    })

    test('ends immediately for no notes', async () => {
        expect(await createMemorySource([], 'name-asc').nextBatch()).toBeNull()
    })

    test('does not change the original notes', async () => {
        await drain(createMemorySource(NOTES, 'name-asc', 2))

        expect(NOTES.map((note) => note.title)).toEqual(['delta', 'alpha', 'charlie', 'bravo'])
    })
})

describe('search cursor', () => {
    const buildCursor = (overrides = {}) => createSearchCursor({
        source: createMemorySource(NOTES, 'name-asc', 1),
        ast: AST,
        context: CONTEXT,
        yieldFn: noYield,
        ...overrides
    })

    test('stops after collecting the target number of matches', async () => {
        const result = await buildCursor().next(2)

        expect(result.found.map((note) => note.title)).toEqual(['alpha', 'bravo'])
        expect(result.done).toBe(false)
    })

    test('continues where the previous call stopped', async () => {
        const cursor = buildCursor()
        await cursor.next(2)
        const result = await cursor.next(2)

        expect(result.found.map((note) => note.title)).toEqual(['charlie', 'delta'])
    })

    test('returns exactly the target even when one batch has more matches', async () => {
        const cursor = buildCursor({ source: createMemorySource(NOTES, 'name-asc', 10) })

        const result = await cursor.next(2)

        expect(result.found.map((note) => note.title)).toEqual(['alpha', 'bravo'])
        expect(result.done).toBe(false)
    })

    test('serves the leftover matches of a batch before reading the source again', async () => {
        const source = createMemorySource(NOTES, 'name-asc', 10)
        const nextBatch = jest.spyOn(source, 'nextBatch')
        const cursor = buildCursor({ source })

        await cursor.next(2)
        const result = await cursor.next(2)

        expect(result.found.map((note) => note.title)).toEqual(['charlie', 'delta'])
        expect(nextBatch).toHaveBeenCalledTimes(1)
    })

    test('is not done while there are buffered matches left', async () => {
        const cursor = buildCursor({ source: createMemorySource(NOTES, 'name-asc', 10) })

        const first = await cursor.next(3)
        const last = await cursor.next(3)

        expect(first.done).toBe(false)
        expect(last.found.map((note) => note.title)).toEqual(['delta'])
        expect(last.done).toBe(true)
    })

    test('reports done once the source is exhausted', async () => {
        const result = await buildCursor().next(10)

        expect(result.found).toHaveLength(4)
        expect(result.done).toBe(true)
    })

    test('keeps scanning past notes that do not match until it finds enough', async () => {
        const notes = [buildNote('a1'), buildNote('a2'), buildNote('a3', 'match'), buildNote('a4', 'match')]
        const cursor = buildCursor({ source: createMemorySource(notes, 'name-asc', 1) })

        const result = await cursor.next(1)

        expect(result.found.map((note) => note.title)).toEqual(['a3'])
    })

    test('reports every batch with matches while it scans', async () => {
        const onProgress = jest.fn()

        await buildCursor().next(3, onProgress)

        expect(onProgress.mock.calls.map(([batch]) => batch.map((note) => note.title))).toEqual([
            ['alpha'],
            ['bravo'],
            ['charlie']
        ])
    })

    test('yields to the interface after each batch', async () => {
        const yieldFn = jest.fn(noYield)

        await buildCursor({ yieldFn }).next(10)

        expect(yieldFn).toHaveBeenCalledTimes(4)
    })

    test('returns null as soon as it is cancelled', async () => {
        const isCancelled = jest.fn().mockReturnValueOnce(false).mockReturnValue(true)

        expect(await buildCursor({ isCancelled }).next(10)).toBeNull()
    })

    test('finds nothing for a source without notes', async () => {
        const cursor = buildCursor({ source: createMemorySource([], 'name-asc') })

        expect(await cursor.next(5)).toEqual({ found: [], done: true })
    })
})

describe('search cursor with notes that have no body in memory', () => {
    const bodyless = ['delta', 'alpha', 'charlie'].map((title) => ({ ...buildNote(title), note: undefined }))
    const stored = new Map(bodyless.map((note) => [note.path, note.title === 'charlie' ? 'other' : 'match']))
    const loadBodies = jest.fn(async (batch) => new Map(batch.map((note) => [note.path, stored.get(note.path)])))

    const build = (overrides = {}) => createSearchCursor({
        source: createMemorySource(bodyless, 'name-asc', 2),
        ast: AST,
        context: CONTEXT,
        yieldFn: noYield,
        loadBodies,
        ...overrides
    })

    beforeEach(() => loadBodies.mockClear())

    test('matches against the bodies loaded for each batch', async () => {
        const result = await build().next(10)

        expect(result.found.map((note) => note.title)).toEqual(['alpha', 'delta'])
        expect(loadBodies).toHaveBeenCalledTimes(2)
    })

    test('loads the bodies of one batch at a time', async () => {
        await build().next(1)

        expect(loadBodies).toHaveBeenCalledTimes(1)
        expect(loadBodies.mock.calls[0][0].map((note) => note.title)).toEqual(['alpha', 'charlie'])
    })

    test('stops when the search is cancelled while the bodies load', async () => {
        const cursor = build({ isCancelled: () => loadBodies.mock.calls.length > 0 })

        expect(await cursor.next(10)).toBeNull()
    })
})
