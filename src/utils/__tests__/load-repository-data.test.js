import fs from 'fs'
import path from 'path'
import { randomUUID } from 'expo-crypto'

import { loadRepositoryData } from '../load-repository-data'
import { parseFrontmatter } from '../frontmatter'

import { getNoteKey } from '../note-key'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import {
    NOTE_FILE_EXTENSION,
    NOTES_FOLDER_NAME,
    TAGS_FILENAME,
    LEGACY_TAGS_FILENAME
} from '@/constants/file-storage'

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }))

const createFakeStorage = (seed = {}) => {
    const data = new Map(Object.entries(seed))
    return {
        getItem: async (key) => (data.has(key) ? data.get(key) : null),
        setItem: async (key, value) => { data.set(key, value) },
        removeItem: async (key) => { data.delete(key) },
        getAllKeys: async () => Array.from(data.keys()),
        multiGet: async (keys) => keys.map((key) => [key, data.has(key) ? data.get(key) : null]),
        multiSet: async (pairs) => pairs.forEach(([key, value]) => data.set(key, value))
    }
}

const createFakeFileStorage = (deviceCache = new Map()) => {
    const files = new Map()

    const filesFor = (uri) => files.get(uri) || (files.set(uri, new Map()), files.get(uri))

    const readJson = async (uri, filename, fallback) => {
        const raw = filesFor(uri).get(filename)
        if (raw === undefined) return fallback
        try { return JSON.parse(raw) } catch { return fallback }
    }
    const writeJson = (uri, filename, value) => { filesFor(uri).set(filename, JSON.stringify(value)) }
    const notesUri = (uri) => `${uri}/${NOTES_FOLDER_NAME}`

    return {
        listMarkdownFiles: (uri) => Array.from(filesFor(uri).entries())
            .filter(([name]) => name.toLowerCase().endsWith(NOTE_FILE_EXTENSION))
            .map(([name, content]) => ({ name, text: async () => content, creationTime: 0, lastModified: 0 })),
        writeNoteFile: (uri, filename, content) => { filesFor(uri).set(filename, content) },
        deleteNoteFile: (uri, filename) => { filesFor(uri).delete(filename) },
        readJson,
        writeJson,
        readNotesJson: (uri, filename, fallback) => readJson(notesUri(uri), filename, fallback),
        writeNotesJson: (uri, filename, value) => writeJson(notesUri(uri), filename, value),
        migrateLegacyVersions: jest.fn(async () => {}),
        findDirectory: jest.fn(() => undefined),
        getOrCreateImagesFolder: (uri) => ({ uri: `${uri}/images` }),
        copyImageFile: async (sourceUri, directoryUri, filename) => {
            if (!deviceCache.has(sourceUri)) {
                throw new Error('source no longer exists on device', sourceUri)
            }
            filesFor(directoryUri).set(filename, deviceCache.get(sourceUri))
            return { uri: `${directoryUri}/${filename}` }
        },
        listFiles: (uri) => Array.from(filesFor(uri).keys())
    }
}

// --- Fixtures ---

const LEGACY_DIR = path.join(__dirname, '..', '..', '..', 'legacy')
const LEGACY_NOTES_PATH = path.join(LEGACY_DIR, 'notes.json')
const LEGACY_TAGS_PATH = path.join(LEGACY_DIR, 'categories.json')
const hasLegacyFixtures = fs.existsSync(LEGACY_NOTES_PATH) && fs.existsSync(LEGACY_TAGS_PATH)

const describeLegacyFixtures = hasLegacyFixtures ? describe : describe.skip
const legacyNotes = hasLegacyFixtures ? JSON.parse(fs.readFileSync(LEGACY_NOTES_PATH, 'utf8')) : []
const legacyTags = hasLegacyFixtures ? JSON.parse(fs.readFileSync(LEGACY_TAGS_PATH, 'utf8')) : []

const REPO_URI = 'content://fake/repo'
const repository = { uri: REPO_URI }

const seedLegacyStorage = () => createFakeStorage({
    [STORAGE_KEYS.NOTES]: JSON.stringify(legacyNotes),
    [STORAGE_KEYS.CATEGORIES]: JSON.stringify(legacyTags)
})

const IMAGE_BYTES = 'image-bytes'

beforeEach(() => {
    let counter = 0
    randomUUID.mockImplementation(() => `uuid-${++counter}`)
})

// --- Tests ---

// migration
describeLegacyFixtures('legacy AsyncStorage migration', () => {
    test('migrates every legacy note into a .md file with matching content', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes).toHaveLength(legacyNotes.length)
        for (const legacyNote of legacyNotes) {
            const migrated = notes.find((note) => note.note.startsWith(legacyNote.note))
            expect(migrated).toBeDefined()
        }
    })

    test('consumes the legacy AsyncStorage keys so migration only runs once', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(await storage.getItem(STORAGE_KEYS.NOTES)).toBeNull()
        expect(await storage.getAllKeys()).toHaveLength(0)
    })

    test('is idempotent: reloading after migration does not duplicate or re-migrate notes', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        await loadRepositoryData([repository], repository, storage, fileStorage)
        const { notes: secondLoad } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(secondLoad).toHaveLength(legacyNotes.length)
    })

    test('translates the legacy note.categories field into note.tags', async () => {
        const legacyNoteWithTags = legacyNotes.find((note) => note.categories.length > 0)
        expect(legacyNoteWithTags).toBeDefined()

        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)
        const migrated = notes.find((note) => note.note.startsWith(legacyNoteWithTags.note))

        expect(migrated.tags.sort()).toEqual([...legacyNoteWithTags.categories].sort())
    })

    test('migrates the legacy tags list and purges the "all" pseudo-tag', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        const { tags } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(tags).not.toContain('all')
        expect(tags.slice().sort()).toEqual(
            legacyTags.filter((tag) => tag.id !== 'all').map((tag) => tag.name).sort()
        )
    })
})

describe('legacy per-note storage entries', () => {
    const seedEntries = (tags) => createFakeStorage({
        [getNoteKey('a')]: JSON.stringify({ id: 'a', title: 'Note', note: 'body', tags }),
        [STORAGE_KEYS.CATEGORIES]: JSON.stringify([
            { id: 'all', name: 'All' },
            { id: 'tag-1', name: 'work' }
        ])
    })

    const readMigrated = async (storage, fileStorage) => {
        await loadRepositoryData([repository], repository, storage, fileStorage)
        const file = fileStorage.listMarkdownFiles(REPO_URI).find((item) => item.name === 'Note.md')
        return parseFrontmatter(await file.text())
    }

    test('resolves tag ids to names in the migrated frontmatter', async () => {
        const { frontmatter, body } = await readMigrated(
            seedEntries(['tag-1']),
            createFakeFileStorage()
        )

        expect(frontmatter).toEqual({ tags: ['work'] })
        expect(body).toBe('body')
    })

    test('keeps tags already stored as names and drops the "all" pseudo-tag', async () => {
        const { frontmatter } = await readMigrated(
            seedEntries(['all', 'work', 'tag-1']),
            createFakeFileStorage()
        )

        expect(frontmatter).toEqual({ tags: ['work'] })
    })
})

describe('legacy blob note content', () => {
    const rootRepository = { id: 'repo-1', uri: REPO_URI }

    const migrate = async (legacyNote, deviceCache = new Map()) => {
        const storage = createFakeStorage({
            [STORAGE_KEYS.NOTES]: JSON.stringify([{ id: 'legacy-1', title: 'Note', ...legacyNote }])
        })
        const fileStorage = createFakeFileStorage(deviceCache)

        const result = await loadRepositoryData([rootRepository], rootRepository, storage, fileStorage)

        return result.notes[0].note
    }

    test('appends migrated images to the body as markdown links', async () => {
        const body = await migrate(
            { note: 'text', images: ['file:///cache/a.png'] },
            new Map([['file:///cache/a.png', IMAGE_BYTES]])
        )

        expect(body).toBe('text\n\n![](content://fake/repo/images/uuid-1.png)')
    })

    test('leaves out images that no longer exist on the device', async () => {
        const body = await migrate({ note: 'text', images: ['file:///cache/gone.png'] })

        expect(body).toBe('text')
    })

    test.each([
        ['bulleted', '- one\n- two'],
        ['numbered', '1. one\n2. two'],
        ['checklist', '- [x] one\n- [ ] two']
    ])('converts a %s list to markdown', async (type, expected) => {
        const body = await migrate({
            note: '',
            list: {
                type,
                items: [
                    { id: 'a', value: 'one', status: 'checked' },
                    { id: 'b', value: 'two', status: 'unchecked' },
                    { id: 'c', value: '  ', status: 'unchecked' }
                ]
            }
        })

        expect(body).toBe(expected)
    })
})

// images
describeLegacyFixtures('legacy image migration', () => {
    test('copies a legacy cache-referenced image into the repository images/ folder', async () => {
        const legacyNoteWithImage = legacyNotes.find((note) => note.images.length > 0)
        expect(legacyNoteWithImage).toBeDefined()

        const imageUri = legacyNoteWithImage.images[0]
        const deviceCache = new Map([[imageUri, IMAGE_BYTES]])
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(deviceCache)

        await loadRepositoryData([repository], repository, storage, fileStorage)

        const expectedCount = legacyNotes.reduce((total, note) => total + note.images.length, 0)
        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(expectedCount)
    })

    test('drops a legacy image whose cache file was already purged by the OS, without throwing', async () => {
        const legacyNoteWithImage = legacyNotes.find((note) => note.images.length > 0)
        expect(legacyNoteWithImage).toBeDefined()

        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(new Map()) // nothing "survived" on device

        const { migration } = await loadRepositoryData([repository], repository, storage, fileStorage)

        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(0)
        expect(migration.failedImages).toBeGreaterThan(0)
    })

    test('reports legacy notes that were renamed because their title was taken', async () => {
        const storage = createFakeStorage({
            [STORAGE_KEYS.NOTES]: JSON.stringify([
                { id: 'legacy-1', title: 'Same', note: 'a' },
                { id: 'legacy-2', title: 'Same', note: 'b' }
            ])
        })
        const fileStorage = createFakeFileStorage(new Map())

        const { migration } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(migration.renamedNotes).toBe(1)
    })

    test('migrates every legacy note image, dropping only the ones missing from the device', async () => {
        const notesWithImages = legacyNotes.filter((note) => note.images.length > 0)
        expect(notesWithImages.length).toBeGreaterThan(0)

        const allImageUris = legacyNotes.flatMap((note) => note.images)
        const deviceCache = new Map(allImageUris.map((uri) => [uri, IMAGE_BYTES]))
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(deviceCache)

        await loadRepositoryData([repository], repository, storage, fileStorage)

        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(allImageUris.length)
    })
})

// tags
describeLegacyFixtures('tags shared across the repository tree', () => {
    test('reads/writes tags at the root repository even when the active node is a subfolder', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        const root = { uri: 'content://fake/root' }
        const subfolder = { uri: 'content://fake/root/sub' }

        const { tags } = await loadRepositoryData([subfolder], root, storage, fileStorage)

        const expectedNames = legacyTags.filter((tag) => tag.id !== 'all').map((tag) => tag.name).sort()
        expect(tags.slice().sort()).toEqual(expectedNames)

        const rootTags = await fileStorage.readNotesJson(root.uri, TAGS_FILENAME, null)
        expect(rootTags).not.toBeNull()
        const subTags = await fileStorage.readNotesJson(subfolder.uri, TAGS_FILENAME, null)
        expect(subTags).toBeNull()
    })
})

// steady state
describe('steady state (no legacy data)', () => {
    test('adopts a foreign .md file with no frontmatter, using default values', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNoteFile(REPO_URI, 'External note.md', 'Added from outside the app.')

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes).toHaveLength(1)
        expect(notes[0].title).toBe('External note')
        expect(notes[0].tags).toEqual([])
    })

    test('preserves a note with invalid frontmatter as-is instead of rewriting it', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        const rawContent = '---\ntags: [unterminated\n---\n\ncontent'
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', rawContent)

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes[0].tags).toEqual([])
        expect(notes[0].invalidFrontmatter).toBe('tags: [unterminated')
        expect(notes[0].note).toBe('content')

        const noteFile = fileStorage.listMarkdownFiles(REPO_URI).find((file) => file.name === 'Note.md')
        expect(await noteFile.text()).toBe(rawContent)
    })

    test('keeps foreign properties and reads comma separated tags from an obsidian note', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        const rawContent = '---\naliases:\n  - Alias\ntags: one, two\n---\n\ncontent'
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', rawContent)

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes[0].tags).toEqual(['one', 'two'])
        expect(notes[0].properties).toEqual({ aliases: ['Alias'] })
        expect(notes[0].note).toBe('content')
    })
})

describe('legacy versions migration', () => {
    test('migrates the versions of every folder and of the templates folder', async () => {
        const fileStorage = createFakeFileStorage()
        fileStorage.findDirectory.mockReturnValue({ uri: `${REPO_URI}/templates` })

        await loadRepositoryData([repository], repository, createFakeStorage(), fileStorage)

        expect(fileStorage.migrateLegacyVersions).toHaveBeenCalledWith(REPO_URI, REPO_URI, '')
        expect(fileStorage.migrateLegacyVersions).toHaveBeenCalledWith(
            `${REPO_URI}/templates`,
            REPO_URI,
            'templates'
        )
    })
})

describe('tags dictionary', () => {
    const readTags = (fileStorage) => fileStorage.readNotesJson(REPO_URI, TAGS_FILENAME, null)

    test('moves the legacy root tags file into the notes folder', async () => {
        const fileStorage = createFakeFileStorage()
        fileStorage.writeJson(REPO_URI, LEGACY_TAGS_FILENAME, ['work'])

        const { tags } = await loadRepositoryData([repository], repository, createFakeStorage(), fileStorage)

        expect(tags).toEqual(['work'])
        expect(await readTags(fileStorage)).toEqual(['work'])
        expect(await fileStorage.readJson(REPO_URI, LEGACY_TAGS_FILENAME, null)).toBeNull()
    })

    test('adds tags used by notes that are missing from the dictionary', async () => {
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNotesJson(REPO_URI, TAGS_FILENAME, ['work'])
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', '---\ntags:\n  - home\n---\n\nbody')

        const { tags } = await loadRepositoryData([repository], repository, createFakeStorage(), fileStorage)

        expect(tags).toEqual(['work', 'home'])
        expect(await readTags(fileStorage)).toEqual(['work', 'home'])
    })

    test('does not duplicate a tag that differs only by case', async () => {
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNotesJson(REPO_URI, TAGS_FILENAME, ['Work'])
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', '---\ntags:\n  - work\n---\n\nbody')

        const { tags } = await loadRepositoryData([repository], repository, createFakeStorage(), fileStorage)

        expect(tags).toEqual(['Work'])
    })

    test('leaves the tags file untouched when nothing needs reconciling', async () => {
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNotesJson(REPO_URI, TAGS_FILENAME, ['work'])
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', '---\ntags:\n  - work\n---\n\nbody')
        const writeNotesJson = jest.spyOn(fileStorage, 'writeNotesJson')

        await loadRepositoryData([repository], repository, createFakeStorage(), fileStorage)

        expect(writeNotesJson).not.toHaveBeenCalled()
    })
})

// tree-wide loading
describe('interrupted migration', () => {
    test('resumes without duplicating notes that were already migrated', async () => {
        const storage = createFakeStorage({
            [getNoteKey('a')]: JSON.stringify({ id: 'a', title: 'First', note: 'one' }),
            [getNoteKey('b')]: JSON.stringify({ id: 'b', title: 'Second', note: 'two' })
        })
        const fileStorage = createFakeFileStorage()
        const writeNoteFile = fileStorage.writeNoteFile
        fileStorage.writeNoteFile = (uri, filename, content) => {
            if (filename === 'Second.md') throw new Error('disk full')
            return writeNoteFile(uri, filename, content)
        }

        await expect(
            loadRepositoryData([repository], repository, storage, fileStorage)
        ).rejects.toThrow('disk full')

        fileStorage.writeNoteFile = writeNoteFile
        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes.map((note) => note.title).sort()).toEqual(['First', 'Second'])
        expect(await storage.getAllKeys()).toEqual([])
    })
})

describe('tree-wide loading', () => {
    test('merges notes from every folder in the tree, each stamped with its own repositoryId', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()

        const root = { id: 'root-id', uri: 'content://fake/tree-root' }
        const subfolder = { id: 'sub-id', uri: 'content://fake/tree-root/sub' }

        fileStorage.writeNoteFile(root.uri, 'Root note.md', 'in root')
        fileStorage.writeNoteFile(subfolder.uri, 'Sub note.md', 'in subfolder')

        const { notes } = await loadRepositoryData([root, subfolder], root, storage, fileStorage)

        expect(notes).toHaveLength(2)

        const rootNote = notes.find((note) => note.title === 'Root note')
        const subNote = notes.find((note) => note.title === 'Sub note')

        expect(rootNote.repositoryId).toBe('root-id')
        expect(subNote.repositoryId).toBe('sub-id')
    })
})
