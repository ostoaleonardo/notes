import { createSearchIndex } from '../search-index'
import { logError } from '../log-error'
import { parseSearchQuery } from '../search-parser'
import { buildNotePath } from '../note-path'

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }))
jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))
jest.mock('../log-error', () => ({ logError: jest.fn() }))

const buildNote = (name, updatedAt = 1) => ({
    path: buildNotePath('repo', `${name}.md`),
    filename: `${name}.md`,
    repositoryId: 'repo',
    title: name,
    note: '',
    updatedAt
})

const NOTES = Array.from({ length: 2000 }, (_, index) => buildNote(`note${index}`))
const NOTE_PATHS = new Map(NOTES.map((note) => [note.path, '']))
const AST = parseSearchQuery('agenda')

const buildIndexed = (notes) => ({
    repositoryIds: notes.map(() => 'repo'),
    filenames: notes.map((note) => note.filename),
    modified: notes.map((note) => note.updatedAt)
})

const buildDatabase = (rows) => ({ getAllAsync: jest.fn(async () => rows) })

const hit = (note) => ({ repositoryId: 'repo', filename: note.filename })

describe('search index candidates', () => {
    beforeEach(() => {
        logError.mockClear()
    })

    test('returns only the matching notes when every note is covered', async () => {
        const database = buildDatabase([hit(NOTES[2]), hit(NOTES[5])])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        await index.refresh(NOTES)

        expect(await index.findCandidates(AST, NOTES, NOTE_PATHS)).toEqual([NOTES[2], NOTES[5]])
    })

    test('keeps notes that are not covered by the index', async () => {
        const edited = { ...NOTES[7], note: 'changed' }
        const notes = NOTES.map((note) => (note === NOTES[7] ? edited : note))
        const database = buildDatabase([hit(NOTES[2])])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        await index.refresh(NOTES)

        expect(await index.findCandidates(AST, notes, NOTE_PATHS)).toEqual([NOTES[2], edited])
    })

    test('keeps notes whose modified time differs from the indexed one', async () => {
        const stale = NOTES.map((note) => (note === NOTES[4] ? { ...note, updatedAt: 99 } : note))
        const database = buildDatabase([])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        await index.refresh(stale)

        expect(await index.findCandidates(AST, stale, NOTE_PATHS)).toEqual([stale[4]])
    })

    test('keeps every note before the first refresh', async () => {
        const database = buildDatabase([])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        expect(await index.findCandidates(AST, NOTES, NOTE_PATHS)).toEqual(NOTES)
    })

    test('gives up when the index returns more than a tenth of the notes', async () => {
        const database = buildDatabase(NOTES.slice(0, 201).map(hit))
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        await index.refresh(NOTES)

        expect(await index.findCandidates(AST, NOTES, NOTE_PATHS)).toBeNull()
    })

    test('asks the database for one row more than the limit', async () => {
        const database = buildDatabase([])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        await index.findCandidates(AST, NOTES, NOTE_PATHS)

        expect(database.getAllAsync.mock.calls[0].at(-1)).toBe(201)
    })

    test('skips the index for a small collection of notes', async () => {
        const database = buildDatabase([])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        expect(await index.findCandidates(AST, NOTES.slice(0, 50), NOTE_PATHS)).toBeNull()
        expect(database.getAllAsync).not.toHaveBeenCalled()
    })

    test('skips the database when the query cannot be filtered', async () => {
        const database = buildDatabase([])
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        expect(await index.findCandidates(parseSearchQuery('-agenda'), NOTES, NOTE_PATHS)).toBeNull()
        expect(database.getAllAsync).not.toHaveBeenCalled()
    })

    test('logs the failure and returns null when the query throws', async () => {
        const failure = new Error('locked')
        const database = { getAllAsync: jest.fn(async () => { throw failure }) }
        const index = createSearchIndex({
            openDatabase: async () => database,
            listIndexedNotes: async () => buildIndexed(NOTES)
        })

        expect(await index.findCandidates(AST, NOTES, NOTE_PATHS)).toBeNull()
        expect(logError).toHaveBeenCalledWith(expect.any(String), failure)
    })

    test('opens the database only once', async () => {
        const openDatabase = jest.fn(async () => buildDatabase([]))
        const index = createSearchIndex({ openDatabase, listIndexedNotes: async () => buildIndexed(NOTES) })

        await index.findCandidates(AST, NOTES, NOTE_PATHS)
        await index.findCandidates(AST, NOTES, NOTE_PATHS)

        expect(openDatabase).toHaveBeenCalledTimes(1)
    })
})
