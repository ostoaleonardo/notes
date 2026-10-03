import { randomUUID } from 'expo-crypto'

import { MAX_STORED_VERSIONS } from '@/constants/default-values'

import {
    commitNoteVersion,
    loadNoteVersions,
    packVersions,
    unpackVersions
} from '../note-versions'

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }))

const FILENAME = 'note-1.md'
const LOCATION = {
    rootUri: 'content://fake/repo',
    folderUri: 'content://fake/repo/sub',
    folderPath: 'sub'
}
const KEY = `${LOCATION.rootUri}|sub/${FILENAME}`

const createFakeFileStorage = (seed = new Map(), existing = true) => ({
    findFile: () => existing,
    readVersions: async (rootUri, key) => seed.get(`${rootUri}|${key}`) || [],
    writeVersions: (rootUri, key, versions) => { seed.set(`${rootUri}|${key}`, versions) }
})

const legacyVersion = (id, content, title = 'Note') => ({
    id,
    title,
    content,
    createdAt: 1
})

beforeEach(() => {
    let counter = 0
    randomUUID.mockImplementation(() => `uuid-${++counter}`)
})

describe('pack and unpack versions', () => {
    const versions = [
        legacyVersion('v1', 'a\nb\nc'),
        legacyVersion('v2', 'a\nB\nc\nd'),
        legacyVersion('v3', 'a\nB\nd')
    ]

    test('restores every snapshot from the packed store', () => {
        expect(unpackVersions(packVersions(versions))).toEqual(versions)
    })

    test('keeps only the newest versions when a limit is given', () => {
        expect(unpackVersions(packVersions(versions), 2)).toEqual(versions.slice(1))
    })

    test('limits a legacy snapshot array the same way', () => {
        expect(unpackVersions(versions, 1)).toEqual(versions.slice(2))
    })

    test('packs an empty history into an empty store', () => {
        expect(unpackVersions(packVersions([]))).toEqual([])
    })

    test('stores only the head content as a full snapshot', () => {
        const store = packVersions(versions)

        expect(store.head).toBe('a\nB\nd')
        expect(store.entries.every((entry) => !('content' in entry))).toBe(true)
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
        const seeded = packVersions([
            legacyVersion('v1', 'one'),
            legacyVersion('v2', 'two'),
            legacyVersion('v3', 'three')
        ])
        const fileStorage = createFakeFileStorage(new Map([[KEY, seeded]]))

        const versions = await loadNoteVersions(fileStorage, LOCATION, FILENAME, 2)

        expect(versions.map((version) => version.content)).toEqual(['two', 'three'])
    })
})

describe('commit note version', () => {
    test('stores the first version as the head', async () => {
        const seed = new Map()

        const committed = await commitNoteVersion(
            createFakeFileStorage(seed),
            LOCATION,
            FILENAME,
            'Note',
            'hello'
        )

        expect(committed).toBe(true)
        expect(seed.get(KEY)).toEqual({
            head: 'hello',
            entries: [
                { id: 'uuid-1', title: 'Note', createdAt: expect.any(Number), delta: null }
            ]
        })
    })

    test('keeps every earlier snapshot recoverable after several commits', async () => {
        const seed = new Map()
        const fileStorage = createFakeFileStorage(seed)

        await commitNoteVersion(fileStorage, LOCATION, FILENAME, 'Note', 'a\nb')
        await commitNoteVersion(fileStorage, LOCATION, FILENAME, 'Note', 'a\nb\nc')
        await commitNoteVersion(fileStorage, LOCATION, FILENAME, 'Note', 'x\nb\nc')

        const versions = await loadNoteVersions(fileStorage, LOCATION, FILENAME)

        expect(versions.map((version) => version.content)).toEqual([
            'a\nb',
            'a\nb\nc',
            'x\nb\nc'
        ])
    })

    test('does not add a version when title and content match the last one', async () => {
        const seed = new Map([[KEY, packVersions([legacyVersion('v1', 'same')])]])

        const committed = await commitNoteVersion(
            createFakeFileStorage(seed),
            LOCATION,
            FILENAME,
            'Note',
            'same'
        )

        expect(committed).toBe(false)
        expect(seed.get(KEY).entries).toHaveLength(1)
    })

    test('adds a version when only the title changed', async () => {
        const seed = new Map([[KEY, packVersions([legacyVersion('v1', 'content', 'Old')])]])
        const fileStorage = createFakeFileStorage(seed)

        await commitNoteVersion(fileStorage, LOCATION, FILENAME, 'New', 'content')

        const versions = await loadNoteVersions(fileStorage, LOCATION, FILENAME)

        expect(versions.map((version) => version.title)).toEqual(['Old', 'New'])
    })

    test('upgrades a legacy snapshot array to a delta store on commit', async () => {
        const seed = new Map([[KEY, [legacyVersion('v1', 'old')]]])
        const fileStorage = createFakeFileStorage(seed)

        await commitNoteVersion(fileStorage, LOCATION, FILENAME, 'Note', 'new')

        expect(Array.isArray(seed.get(KEY))).toBe(false)
        expect(
            (await loadNoteVersions(fileStorage, LOCATION, FILENAME)).map((v) => v.content)
        ).toEqual(['old', 'new'])
    })

    test('does not write a history file when the note no longer exists', async () => {
        const seed = new Map()

        const committed = await commitNoteVersion(
            createFakeFileStorage(seed, false),
            LOCATION,
            FILENAME,
            'Note',
            'hello'
        )

        expect(committed).toBe(false)
        expect(seed.size).toBe(0)
    })
})

describe('version pruning', () => {
    test('drops the oldest versions once the cap is exceeded', async () => {
        const seed = new Map()
        const fileStorage = createFakeFileStorage(seed)
        const total = MAX_STORED_VERSIONS + 3

        for (let index = 0; index < total; index++) {
            await commitNoteVersion(fileStorage, LOCATION, FILENAME, 'Note', `line ${index}`)
        }

        const versions = await loadNoteVersions(fileStorage, LOCATION, FILENAME)

        expect(versions).toHaveLength(MAX_STORED_VERSIONS)
        expect(versions[0].content).toBe('line 3')
        expect(versions[versions.length - 1].content).toBe(`line ${total - 1}`)
    })
})
