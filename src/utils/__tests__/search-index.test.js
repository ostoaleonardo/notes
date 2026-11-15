import { SourceOverflowError, createSearchIndex } from '../search-index'
import { parseSearchQuery } from '../search-parser'
import { buildNotePath } from '../note-path'

jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))

const buildNote = (name, updatedAt = 1) => ({
    path: buildNotePath('repo', `${name}.md`),
    filename: `${name}.md`,
    repositoryId: 'repo',
    title: name,
    note: '',
    updatedAt
})

const NOTES = Array.from({ length: 2000 }, (_, index) => buildNote(`note${String(index).padStart(4, '0')}`))
const NOTE_PATHS = new Map(NOTES.map((note) => [note.path, '']))
const AST = parseSearchQuery('agenda')
const SORT = 'name-asc'

const buildIndexed = (notes) => ({
    repositoryIds: notes.map(() => 'repo'),
    filenames: notes.map((note) => note.filename),
    modified: notes.map((note) => note.updatedAt)
})

const row = (note, id) => ({
    id,
    repositoryId: 'repo',
    filename: note.filename,
    sortKey: `key-${note.title}`,
    modified: note.updatedAt
})

const buildIndex = (pages) => {
    const query = jest.fn()
    pages.forEach((page) => query.mockResolvedValueOnce(page))

    const index = createSearchIndex({ query, listIndexedNotes: async () => buildIndexed(NOTES) })

    return { index, query }
}

const request = (overrides = {}) => ({ ast: AST, notes: NOTES, notePaths: NOTE_PATHS, sort: SORT, ...overrides })

const titles = (batch) => batch.map((note) => note.title)

describe('search index source', () => {
    test('skips the index for a small collection of notes', async () => {
        const { index } = buildIndex([])
        await index.refresh(NOTES)

        expect(index.createSource(request({ notes: NOTES.slice(0, 50) }))).toBeNull()
    })

    test('skips the index when too many notes are not covered', () => {
        const { index } = buildIndex([])

        expect(index.createSource(request())).toBeNull()
    })

    test('returns the notes of a database page in the order of the page', async () => {
        const { index } = buildIndex([[row(NOTES[7], 8), row(NOTES[3], 4)]])
        await index.refresh(NOTES)

        const source = index.createSource(request())

        expect(titles(await source.nextBatch())).toEqual(['note0007', 'note0003'])
    })

    test('asks for the next page after the last row of the previous one', async () => {
        const firstPage = Array.from({ length: 500 }, (_, position) => row(NOTES[position], position + 1))
        const { index, query } = buildIndex([firstPage, [row(NOTES[500], 501)]])
        await index.refresh(NOTES)

        const source = index.createSource(request())
        await source.nextBatch()
        const second = await source.nextBatch()

        expect(titles(second)).toEqual(['note0500'])
        expect(query.mock.calls[1]).toContain('key-note0499')
        expect(query.mock.calls[1]).toContain(500)
    })

    test('finishes after a short page', async () => {
        const { index } = buildIndex([[row(NOTES[1], 2)]])
        await index.refresh(NOTES)

        const source = index.createSource(request())
        await source.nextBatch()

        expect(await source.nextBatch()).toBeNull()
    })

    test('places an uncovered note in order among the database rows', async () => {
        const edited = { ...NOTES[2], note: 'changed', updatedAt: 99 }
        const notes = NOTES.map((note) => (note === NOTES[2] ? edited : note))
        const { index } = buildIndex([[row(NOTES[1], 2), row(NOTES[2], 3), row(NOTES[3], 4)]])
        await index.refresh(NOTES)

        const source = index.createSource(request({ notes }))

        expect(titles(await source.nextBatch())).toEqual(['note0001', 'note0002', 'note0003'])
        expect((await source.nextBatch())).toBeNull()
    })

    test('appends the uncovered notes that sort after the last database row', async () => {
        const created = buildNote('zzz-new')
        const notes = [...NOTES, created]
        const { index } = buildIndex([[row(NOTES[1], 2)]])
        await index.refresh(NOTES)

        const source = index.createSource(request({ notes }))

        expect(titles(await source.nextBatch())).toEqual(['note0001', 'zzz-new'])
    })

    test('skips database rows for notes that are not loaded', async () => {
        const ghost = buildNote('ghost')
        const { index } = buildIndex([[row(ghost, 9), row(NOTES[4], 5)]])
        await index.refresh(NOTES)

        const source = index.createSource(request())

        expect(titles(await source.nextBatch())).toEqual(['note0004'])
    })

    test('filters the page query with the full text index when the query allows it', async () => {
        const { index, query } = buildIndex([[]])
        await index.refresh(NOTES)

        await index.createSource(request()).nextBatch()

        expect(query.mock.calls[0][0]).toContain('MATCH')
    })

    test('skips the index when the query cannot use the full text index', async () => {
        const { index } = buildIndex([])
        await index.refresh(NOTES)

        expect(index.createSource(request({ ast: parseSearchQuery('-agenda') }))).toBeNull()
        expect(index.createSource(request({ ast: parseSearchQuery('ag') }))).toBeNull()
    })

    test('gives up when the candidates do not fit in a few pages', async () => {
        const fullPage = (offset) => Array.from({ length: 500 }, (_, position) => row(NOTES[offset + position], offset + position + 1))
        const { index, query } = buildIndex([fullPage(0), fullPage(500), fullPage(1000)])
        await index.refresh(NOTES)

        const source = index.createSource(request())
        await source.nextBatch()
        await source.nextBatch()
        await source.nextBatch()

        await expect(source.nextBatch()).rejects.toBeInstanceOf(SourceOverflowError)
        expect(query).toHaveBeenCalledTimes(3)
    })

    test('rejects when the database fails', async () => {
        const failure = new Error('locked')
        const index = createSearchIndex({
            query: jest.fn().mockRejectedValue(failure),
            listIndexedNotes: async () => buildIndexed(NOTES)
        })
        await index.refresh(NOTES)

        await expect(index.createSource(request()).nextBatch()).rejects.toBe(failure)
    })
})
