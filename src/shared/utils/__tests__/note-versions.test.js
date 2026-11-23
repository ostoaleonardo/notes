import {
    commitNoteVersion,
    loadNoteVersions,
    unpackVersions
} from '../note-versions'

const FILENAME = 'note-1.md'
const LOCATION = {
    rootUri: 'content://fake/repo',
    folderUri: 'content://fake/repo/sub',
    folderPath: 'sub'
}
const KEY = `${LOCATION.rootUri}|sub/${FILENAME}`

const createFakeFileStorage = (seed = new Map(), existing = true) => ({
    findFile: () => existing,
    readVersions: async (rootUri, key) => seed.get(`${rootUri}|${key}`) || []
})

const legacyVersion = (id, content, title = 'Note') => ({
    id,
    title,
    content,
    createdAt: 1
})

const DELTA_STORE = {
    head: 'three',
    entries: [
        { id: 'v1', title: 'Note', createdAt: 1, delta: [{ at: 0, remove: 1, insert: ['one'] }] },
        { id: 'v2', title: 'Note', createdAt: 1, delta: [{ at: 0, remove: 1, insert: ['two'] }] },
        { id: 'v3', title: 'Note', createdAt: 1, delta: null }
    ]
}

describe('unpack versions', () => {
    test('restores every snapshot from the delta store', () => {
        const contents = unpackVersions(DELTA_STORE).map((version) => version.content)

        expect(contents).toEqual(['one', 'two', 'three'])
    })

    test('keeps only the newest versions when a limit is given', () => {
        expect(unpackVersions(DELTA_STORE, 2).map((version) => version.id)).toEqual(['v2', 'v3'])
    })

    test('limits a legacy snapshot array the same way', () => {
        const versions = [legacyVersion('v1', 'a'), legacyVersion('v2', 'b'), legacyVersion('v3', 'c')]

        expect(unpackVersions(versions, 1)).toEqual(versions.slice(2))
    })

    test('unpacks an empty store into an empty list', () => {
        expect(unpackVersions({ head: '', entries: [] })).toEqual([])
    })
})

describe('load note versions', () => {
    test('returns an empty list for a note with no history', async () => {
        const versions = await loadNoteVersions(createFakeFileStorage(), LOCATION, FILENAME)

        expect(versions).toEqual([])
    })

    test('reads a legacy snapshot array', async () => {
        const seeded = [legacyVersion('v1', 'hello')]
        const fileStorage = createFakeFileStorage(new Map([[KEY, seeded]]))

        const versions = await loadNoteVersions(fileStorage, LOCATION, FILENAME)

        expect(versions).toEqual(seeded)
    })

    test('applies the limit to a delta store', async () => {
        const fileStorage = createFakeFileStorage(new Map([[KEY, DELTA_STORE]]))

        const versions = await loadNoteVersions(fileStorage, LOCATION, FILENAME, 2)

        expect(versions.map((version) => version.content)).toEqual(['two', 'three'])
    })
})

describe('commit note version', () => {
    test('delegates the commit to the file storage with the version key', async () => {
        const commitVersion = jest.fn(async () => true)
        const fileStorage = { findFile: () => true, commitVersion }

        const limits = { maxVersions: 25, maxAgeMs: 0 }

        const committed = await commitNoteVersion(
            fileStorage,
            LOCATION,
            FILENAME,
            'Note',
            'hello',
            limits
        )

        expect(committed).toBe(true)
        expect(commitVersion).toHaveBeenCalledWith(
            LOCATION.rootUri,
            `sub/${FILENAME}`,
            'Note',
            'hello',
            limits
        )
    })

    test('returns false without committing when the note file no longer exists', async () => {
        const commitVersion = jest.fn()

        const committed = await commitNoteVersion(
            { findFile: () => undefined, commitVersion },
            LOCATION,
            FILENAME,
            'Note',
            'hello'
        )

        expect(committed).toBe(false)
        expect(commitVersion).not.toHaveBeenCalled()
    })
})
