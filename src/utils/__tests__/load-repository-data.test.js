import fs from 'fs'
import path from 'path'
import { randomUUID } from 'expo-crypto'

import { loadRepositoryData } from '../load-repository-data'
import { parseFrontmatter } from '../frontmatter'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { METADATA_FILENAME, SIDECAR_FILENAMES, NOTE_FILE_EXTENSION } from '@/constants/file-storage'

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }))

const createFakeStorage = (seed = {}) => {
    const data = new Map(Object.entries(seed))
    return {
        getItem: async (key) => (data.has(key) ? data.get(key) : null),
        setItem: async (key, value) => { data.set(key, value) },
        removeItem: async (key) => { data.delete(key) },
        getAllKeys: async () => Array.from(data.keys()),
        multiGet: async (keys) => keys.map((key) => [key, data.has(key) ? data.get(key) : null]),
        multiSet: async (pairs) => pairs.forEach(([key, value]) => data.set(key, value)),
        multiRemove: async (keys) => keys.forEach((key) => data.delete(key))
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

    return {
        listMarkdownFiles: (uri) => Array.from(filesFor(uri).entries())
            .filter(([name]) => !SIDECAR_FILENAMES.includes(name) && name.toLowerCase().endsWith(NOTE_FILE_EXTENSION))
            .map(([name, content]) => ({ name, text: async () => content, creationTime: 0, lastModified: 0 })),
        writeNoteFile: (uri, filename, content) => { filesFor(uri).set(filename, content) },
        deleteNoteFile: (uri, filename) => { filesFor(uri).delete(filename) },
        readMetadata: (uri) => readJson(uri, METADATA_FILENAME, {}),
        writeMetadata: (uri, metadata) => writeJson(uri, METADATA_FILENAME, metadata),
        readJson,
        writeJson,
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
const LEGACY_IMAGES_DIR = path.join(LEGACY_DIR, 'images')
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

const readLocalImageBytes = (uri) => fs.readFileSync(path.join(LEGACY_IMAGES_DIR, path.basename(uri)))

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
            const migrated = notes.find((note) => note.note === legacyNote.note)
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
        const migrated = notes.find((note) => note.note === legacyNoteWithTags.note)

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

// images
describeLegacyFixtures('legacy image migration', () => {
    test('copies a legacy cache-referenced image into the repository images/ folder', async () => {
        const legacyNoteWithImage = legacyNotes.find((note) => note.images.length > 0)
        expect(legacyNoteWithImage).toBeDefined()

        const imageUri = legacyNoteWithImage.images[0]
        const deviceCache = new Map([[imageUri, readLocalImageBytes(imageUri)]])
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(deviceCache)

        await loadRepositoryData([repository], repository, storage, fileStorage)

        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(1)
    })

    test('drops a legacy image whose cache file was already purged by the OS, without throwing', async () => {
        const legacyNoteWithImage = legacyNotes.find((note) => note.images.length > 0)
        expect(legacyNoteWithImage).toBeDefined()

        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(new Map()) // nothing "survived" on device

        await expect(loadRepositoryData([repository], repository, storage, fileStorage)).resolves.not.toThrow()

        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(0)
    })

    test('migrates every legacy note image, dropping only the ones missing from the device', async () => {
        const notesWithImages = legacyNotes.filter((note) => note.images.length > 0)
        expect(notesWithImages.length).toBeGreaterThan(0)

        const allImageUris = legacyNotes.flatMap((note) => note.images)
        const deviceCache = new Map(allImageUris.map((uri) => [uri, readLocalImageBytes(uri)]))
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

        const rootSidecar = await fileStorage.readJson(root.uri, '.tags.json', null)
        expect(rootSidecar).not.toBeNull()
        const subSidecar = await fileStorage.readJson(subfolder.uri, '.tags.json', null)
        expect(subSidecar).toBeNull()
    })
})

// steady state
describe('steady state (no legacy data)', () => {
    test('adopts a foreign .md file with no metadata entry, using default values', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNoteFile(REPO_URI, 'External note.md', 'Added from outside the app.')

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes).toHaveLength(1)
        expect(notes[0].title).toBe('External note')
        expect(notes[0].tags).toEqual([])
    })

    test('migrates metadata keyed by a random id into embedded frontmatter, resolving tag ids to names', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', 'content')
        fileStorage.writeJson(REPO_URI, '.tags.json', [{ id: 'tag-1', name: 'work' }])
        fileStorage.writeMetadata(REPO_URI, {
            'old-uuid': { filename: 'Note.md', tags: ['tag-1'], createdAt: 1, updatedAt: '2' }
        })

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes[0].tags).toEqual(['work'])

        const noteFile = fileStorage.listMarkdownFiles(REPO_URI).find((file) => file.name === 'Note.md')
        const { frontmatter, body } = parseFrontmatter(await noteFile.text())
        expect(frontmatter).toEqual({ tags: ['work'] })
        expect(body).toBe('content')

        expect(await fileStorage.readMetadata(REPO_URI)).toEqual({})
        expect(fileStorage.listFiles(REPO_URI)).not.toContain(METADATA_FILENAME)
    })

    test('drops a tag id from a legacy note that no longer resolves in the tag dictionary', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', 'content')
        fileStorage.writeMetadata(REPO_URI, {
            'Note.md': { tags: ['deleted-tag-id'], createdAt: 1, updatedAt: '' }
        })

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes[0].tags).toEqual([])
    })

    test('ignores a stale sidecar entry for a note that already has frontmatter', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', '---\ntags:\n  - real\n---\n\ncontent')
        fileStorage.writeMetadata(REPO_URI, {
            'Note.md': { tags: ['stale'], createdAt: 999, updatedAt: '' }
        })

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes[0].tags).toEqual(['real'])
        expect(await fileStorage.readMetadata(REPO_URI)).toEqual({})
        expect(fileStorage.listFiles(REPO_URI)).not.toContain(METADATA_FILENAME)
    })

    test('preserves a note with invalid frontmatter as-is instead of rewriting it', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        const rawContent = '---\ntags: [unterminated\n---\n\ncontent'
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', rawContent)
        fileStorage.writeMetadata(REPO_URI, {
            'Note.md': { tags: ['stale'], createdAt: 999, updatedAt: '' }
        })

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes[0].tags).toEqual([])
        expect(notes[0].invalidFrontmatter).toBe('tags: [unterminated')
        expect(notes[0].note).toBe('content')

        const noteFile = fileStorage.listMarkdownFiles(REPO_URI).find((file) => file.name === 'Note.md')
        expect(await noteFile.text()).toBe(rawContent)
    })

    test('prunes metadata entries whose .md file was removed externally', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeMetadata(REPO_URI, {
            'ghost-id': { filename: 'Deleted externally.md', tags: [], createdAt: 1, updatedAt: '' }
        })

        const { notes } = await loadRepositoryData([repository], repository, storage, fileStorage)

        expect(notes).toEqual([])
        const metadata = await fileStorage.readMetadata(REPO_URI)
        expect(metadata['ghost-id']).toBeUndefined()
    })
})

// tree-wide loading
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
