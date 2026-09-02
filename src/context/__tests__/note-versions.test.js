import { randomUUID } from 'expo-crypto'
import { commitNoteVersion, loadNoteVersions } from '../note-versions'

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }))

const REPO_URI = 'content://fake/repo'
const NOTE_ID = 'note-1'

const createFakeFileStorage = (seed = new Map()) => ({
    readVersions: async (uri, noteId) => seed.get(`${uri}/${noteId}`) || [],
    writeVersions: (uri, noteId, versions) => { seed.set(`${uri}/${noteId}`, versions) }
})

beforeEach(() => {
    let counter = 0
    randomUUID.mockImplementation(() => `uuid-${++counter}`)
})

describe('load note versions', () => {
    test('returns an empty list for a note with no history', async () => {
        const fileStorage = createFakeFileStorage()

        const versions = await loadNoteVersions(fileStorage, REPO_URI, NOTE_ID)

        expect(versions).toEqual([])
    })

    test('returns the stored versions for the note', async () => {
        const seeded = [{ id: 'v1', title: 'Note', content: 'hello', createdAt: 1 }]
        const fileStorage = createFakeFileStorage(new Map([[`${REPO_URI}/${NOTE_ID}`, seeded]]))

        const versions = await loadNoteVersions(fileStorage, REPO_URI, NOTE_ID)

        expect(versions).toEqual(seeded)
    })
})

describe('commit note version', () => {
    test('appends a new version when there is no previous history', async () => {
        const fileStorage = createFakeFileStorage()

        const versions = await commitNoteVersion(fileStorage, REPO_URI, NOTE_ID, 'Note', 'hello')

        expect(versions).toEqual([
            { id: 'uuid-1', title: 'Note', content: 'hello', createdAt: expect.any(Number) }
        ])
    })

    test('appends a new version when the content changed since the last one', async () => {
        const seeded = [{ id: 'v1', title: 'Note', content: 'old content', createdAt: 1 }]
        const fileStorage = createFakeFileStorage(new Map([[`${REPO_URI}/${NOTE_ID}`, seeded]]))

        const versions = await commitNoteVersion(fileStorage, REPO_URI, NOTE_ID, 'Note', 'new content')

        expect(versions).toHaveLength(2)
        expect(versions[1].content).toBe('new content')
    })

    test('does not duplicate a version when the content matches the last one', async () => {
        const seeded = [{ id: 'v1', title: 'Note', content: 'same content', createdAt: 1 }]
        const fileStorage = createFakeFileStorage(new Map([[`${REPO_URI}/${NOTE_ID}`, seeded]]))

        const versions = await commitNoteVersion(fileStorage, REPO_URI, NOTE_ID, 'Note', 'same content')

        expect(versions).toEqual(seeded)
    })

    test('appends a new version when only the title changed', async () => {
        const seeded = [{ id: 'v1', title: 'Old title', content: 'content', createdAt: 1 }]
        const fileStorage = createFakeFileStorage(new Map([[`${REPO_URI}/${NOTE_ID}`, seeded]]))

        const versions = await commitNoteVersion(fileStorage, REPO_URI, NOTE_ID, 'New title', 'content')

        expect(versions).toHaveLength(2)
        expect(versions[1].title).toBe('New title')
    })
})
