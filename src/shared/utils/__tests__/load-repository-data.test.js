import fs from 'fs'
import path from 'path'
import { randomUUID } from 'expo-crypto'

import { loadRepositoryData } from '../load-repository-data'
import { parseFrontmatter } from '../frontmatter'

import { getNoteKey } from '../note-key'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { NOTE_KEY_PREFIX } from '@/shared/constants/note-key'
import {
    NOTE_FILE_EXTENSION,
    NOTE_READ_BATCH_SIZE,
    NOTES_FOLDER_NAME
} from '@/shared/constants/file-storage'

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

const getLegacyNoteKeys = async (storage) => (
    (await storage.getAllKeys()).filter((key) => key.startsWith(NOTE_KEY_PREFIX))
)

const createFakeFileStorage = (deviceCache = new Map()) => {
    const files = new Map()

    const filesFor = (uri) => files.get(uri) || (files.set(uri, new Map()), files.get(uri))

    const readJson = async (uri, filename, fallback) => {
        const raw = filesFor(uri).get(filename)
        if (raw === undefined) return fallback
        try { return JSON.parse(raw) } catch { return fallback }
    }
    const writeJson = (uri, filename, value) => {
        filesFor(uri).set(filename, JSON.stringify(value))
    }
    const notesUri = (uri) => `${uri}/${NOTES_FOLDER_NAME}`

    const listMarkdownFiles = (uri) => Array.from(filesFor(uri).entries())
        .filter(([name]) => name.toLowerCase().endsWith(NOTE_FILE_EXTENSION))
        .map(([name, content]) => ({
            name,
            uri: `${uri}/${name}`,
            text: async () => content,
            lastModified: 0
        }))

    const readTextFile = (fileUri) => {
        const separator = fileUri.lastIndexOf('/')
        return filesFor(fileUri.slice(0, separator)).get(fileUri.slice(separator + 1)) ?? null
    }

    return {
        listMarkdownFiles,
        scanMarkdownFiles: async (uri) => listMarkdownFiles(uri),
        readTextFiles: async (fileUris) => fileUris.map(readTextFile),
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

const LEGACY_DIR = path.join(__dirname, '..', '..', '..', '..', 'legacy')
const LEGACY_NOTES_PATH = path.join(LEGACY_DIR, 'notes.json')
const LEGACY_TAGS_PATH = path.join(LEGACY_DIR, 'categories.json')
const hasLegacyFixtures = fs.existsSync(LEGACY_NOTES_PATH) && fs.existsSync(LEGACY_TAGS_PATH)

const describeLegacyFixtures = hasLegacyFixtures ? describe : describe.skip
const legacyNotes = hasLegacyFixtures ? JSON.parse(fs.readFileSync(LEGACY_NOTES_PATH, 'utf8')) : []
const legacyTags = hasLegacyFixtures ? JSON.parse(fs.readFileSync(LEGACY_TAGS_PATH, 'utf8')) : []

const REPO_URI = 'content://fake/repo'
const folder = { uri: REPO_URI }

const seedLegacyStorage = () => createFakeStorage({
    [STORAGE_KEYS.NOTES]: JSON.stringify(legacyNotes),
    [STORAGE_KEYS.CATEGORIES]: JSON.stringify(legacyTags)
})

const IMAGE_BYTES = 'image-bytes'

beforeEach(() => {
    let counter = 0
    randomUUID.mockImplementation(() => `uuid-${++counter}`)
})

describeLegacyFixtures('legacy AsyncStorage migration', () => {
    test('migrates every legacy note into a .md file with matching content', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        const { notes } = await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(notes).toHaveLength(legacyNotes.length)
        for (const legacyNote of legacyNotes) {
            const migrated = notes.find((note) => note.note.startsWith(legacyNote.note))
            expect(migrated).toBeDefined()
        }
    })

    test('consumes the legacy AsyncStorage keys so migration only runs once', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(await storage.getItem(STORAGE_KEYS.NOTES)).toBeNull()
        expect(await getLegacyNoteKeys(storage)).toHaveLength(0)
    })

    test('is idempotent: reloading after migration does not re-migrate notes', async () => {
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        await loadRepositoryData([folder], folder, storage, fileStorage)
        const { notes: secondLoad } = await loadRepositoryData(
            [folder],
            folder,
            storage,
            fileStorage
        )

        expect(secondLoad).toHaveLength(legacyNotes.length)
    })

    test('translates the legacy note.categories field into note.tags', async () => {
        const legacyNoteWithTags = legacyNotes.find((note) => note.categories.length > 0)
        expect(legacyNoteWithTags).toBeDefined()

        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage()

        const { notes } = await loadRepositoryData([folder], folder, storage, fileStorage)
        const migrated = notes.find((note) => note.note.startsWith(legacyNoteWithTags.note))

        expect(migrated.tags.sort()).toEqual([...legacyNoteWithTags.categories].sort())
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
        await loadRepositoryData([folder], folder, storage, fileStorage)
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

        const result = await loadRepositoryData(
            [rootRepository],
            rootRepository,
            storage,
            fileStorage
        )

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

describeLegacyFixtures('legacy image migration', () => {
    test('copies a legacy cache-referenced image into the folder images/ folder', async () => {
        const legacyNoteWithImage = legacyNotes.find((note) => note.images.length > 0)
        expect(legacyNoteWithImage).toBeDefined()

        const imageUri = legacyNoteWithImage.images[0]
        const deviceCache = new Map([[imageUri, IMAGE_BYTES]])
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(deviceCache)

        await loadRepositoryData([folder], folder, storage, fileStorage)

        const expectedCount = legacyNotes.reduce((total, note) => total + note.images.length, 0)
        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(expectedCount)
    })

    test('drops a legacy image whose cache file was purged, without throwing', async () => {
        const legacyNoteWithImage = legacyNotes.find((note) => note.images.length > 0)
        expect(legacyNoteWithImage).toBeDefined()

        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(new Map())

        const { migration } = await loadRepositoryData(
            [folder],
            folder,
            storage,
            fileStorage
        )

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

        const { migration } = await loadRepositoryData(
            [folder],
            folder,
            storage,
            fileStorage
        )

        expect(migration.renamedNotes).toBe(1)
    })

    test('migrates every legacy image, dropping only the ones missing on device', async () => {
        const notesWithImages = legacyNotes.filter((note) => note.images.length > 0)
        expect(notesWithImages.length).toBeGreaterThan(0)

        const allImageUris = legacyNotes.flatMap((note) => note.images)
        const deviceCache = new Map(allImageUris.map((uri) => [uri, IMAGE_BYTES]))
        const storage = seedLegacyStorage()
        const fileStorage = createFakeFileStorage(deviceCache)

        await loadRepositoryData([folder], folder, storage, fileStorage)

        const copiedFiles = fileStorage.listFiles(`${REPO_URI}/images`)
        expect(copiedFiles).toHaveLength(allImageUris.length)
    })
})

describe('steady state (no legacy data)', () => {
    test('adopts a foreign .md file with no frontmatter, using default values', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        fileStorage.writeNoteFile(REPO_URI, 'External note.md', 'Added from outside the app.')

        const { notes } = await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(notes).toHaveLength(1)
        expect(notes[0].title).toBe('External note')
        expect(notes[0].tags).toEqual([])
    })

    test('preserves a note with invalid frontmatter as-is instead of rewriting it', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        const rawContent = '---\ntags: [unterminated\n---\n\ncontent'
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', rawContent)

        const { notes } = await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(notes[0].tags).toEqual([])
        expect(notes[0].invalidFrontmatter).toBe('tags: [unterminated')
        expect(notes[0].note).toBe('content')

        const noteFile = fileStorage.listMarkdownFiles(REPO_URI).find(
            (file) => file.name === 'Note.md'
        )
        expect(await noteFile.text()).toBe(rawContent)
    })

    test('keeps foreign properties and reads comma separated tags', async () => {
        const storage = createFakeStorage()
        const fileStorage = createFakeFileStorage()
        const rawContent = '---\naliases:\n  - Alias\ntags: one, two\n---\n\ncontent'
        fileStorage.writeNoteFile(REPO_URI, 'Note.md', rawContent)

        const { notes } = await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(notes[0].tags).toEqual(['one', 'two'])
        expect(notes[0].properties).toEqual({ aliases: ['Alias'] })
        expect(notes[0].note).toBe('content')
    })
})

describe('legacy versions migration', () => {
    test('migrates the versions of every folder and of the templates folder', async () => {
        const fileStorage = createFakeFileStorage()
        fileStorage.findDirectory.mockReturnValue({ uri: `${REPO_URI}/templates` })

        await loadRepositoryData([folder], folder, createFakeStorage(), fileStorage)

        expect(fileStorage.migrateLegacyVersions).toHaveBeenCalledWith(REPO_URI, REPO_URI, '')
        expect(fileStorage.migrateLegacyVersions).toHaveBeenCalledWith(
            `${REPO_URI}/templates`,
            REPO_URI,
            'templates'
        )
    })

    test('skips the migration once it already ran for the root', async () => {
        const fileStorage = createFakeFileStorage()
        const storage = createFakeStorage()

        await loadRepositoryData([folder], folder, storage, fileStorage)
        fileStorage.migrateLegacyVersions.mockClear()
        await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(fileStorage.migrateLegacyVersions).not.toHaveBeenCalled()
    })
})

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
            loadRepositoryData([folder], folder, storage, fileStorage)
        ).rejects.toThrow('disk full')

        fileStorage.writeNoteFile = writeNoteFile
        const { notes } = await loadRepositoryData([folder], folder, storage, fileStorage)

        expect(notes.map((note) => note.title).sort()).toEqual(['First', 'Second'])
        expect(await getLegacyNoteKeys(storage)).toEqual([])
    })
})

describe('tree-wide loading', () => {
    test('merges notes from every folder, each stamped with its folderId', async () => {
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

        expect(rootNote.folderId).toBe('root-id')
        expect(subNote.folderId).toBe('sub-id')
    })
})

describe('reload with previous notes', () => {
    const setupFiles = () => {
        const fileStorage = createFakeFileStorage()
        const reads = []
        const readTextFiles = fileStorage.readTextFiles

        fileStorage.readTextFiles = (fileUris) => {
            reads.push(...fileUris.map((fileUri) => fileUri.split('/').pop()))
            return readTextFiles(fileUris)
        }
        fileStorage.writeNoteFile(REPO_URI, 'A.md', 'body')

        return { fileStorage, reads }
    }

    const tree = [{ id: 'repo', uri: REPO_URI }]

    test('keeps the file uri on every loaded note', async () => {
        const { fileStorage } = setupFiles()

        const { notes } = await loadRepositoryData(tree, tree[0], createFakeStorage(), fileStorage)

        expect(notes[0].fileUri).toBe(`${REPO_URI}/A.md`)
    })

    test('reuses notes whose file did not change', async () => {
        const { fileStorage, reads } = setupFiles()
        const storage = createFakeStorage()

        const first = await loadRepositoryData(tree, tree[0], storage, fileStorage)
        const second = await loadRepositoryData(tree, tree[0], storage, fileStorage, first.notes)

        expect(reads).toEqual(['A.md'])
        expect(second.notes[0]).toBe(first.notes[0])
    })

    test('reports nothing changed when every file matches the previous notes', async () => {
        const { fileStorage } = setupFiles()
        const storage = createFakeStorage()
        const onProgress = jest.fn()

        const first = await loadRepositoryData(tree, tree[0], storage, fileStorage)
        const second = await loadRepositoryData(tree, tree[0], storage, fileStorage, first.notes, onProgress)

        expect(first.changed).toBe(true)
        expect(second.changed).toBe(false)
        expect(onProgress).not.toHaveBeenCalled()
    })

    test('reports a change when a previous note is gone from disk', async () => {
        const { fileStorage } = setupFiles()
        const storage = createFakeStorage()

        const first = await loadRepositoryData(tree, tree[0], storage, fileStorage)
        fileStorage.deleteNoteFile(REPO_URI, 'A.md')
        const second = await loadRepositoryData(tree, tree[0], storage, fileStorage, first.notes)

        expect(second.notes).toEqual([])
        expect(second.changed).toBe(true)
    })

    test('reads changed files in batches and reports progress after each one', async () => {
        const { fileStorage, reads } = setupFiles()
        const total = NOTE_READ_BATCH_SIZE + 1
        for (let index = 1; index < total; index++) {
            fileStorage.writeNoteFile(REPO_URI, `Note ${index}.md`, 'body')
        }
        const onProgress = jest.fn()

        const { notes } = await loadRepositoryData(tree, tree[0], createFakeStorage(), fileStorage, [], onProgress)

        expect(notes).toHaveLength(total)
        expect(reads).toHaveLength(total)
        expect(onProgress.mock.calls).toEqual([
            [0, total],
            [NOTE_READ_BATCH_SIZE, total],
            [total, total]
        ])
    })

    test('keeps the previous note when a changed file cannot be read', async () => {
        const { fileStorage } = setupFiles()
        const storage = createFakeStorage()

        const first = await loadRepositoryData(tree, tree[0], storage, fileStorage)
        const stale = first.notes.map((note) => ({ ...note, updatedAt: 1 }))
        fileStorage.readTextFiles = async (fileUris) => fileUris.map(() => null)
        const second = await loadRepositoryData(tree, tree[0], storage, fileStorage, stale)

        expect(second.notes).toEqual(stale)
    })

    test('rereads notes whose file changed', async () => {
        const { fileStorage, reads } = setupFiles()
        const storage = createFakeStorage()

        const first = await loadRepositoryData(tree, tree[0], storage, fileStorage)
        const stale = first.notes.map((note) => ({ ...note, updatedAt: 1 }))
        await loadRepositoryData(tree, tree[0], storage, fileStorage, stale)

        expect(reads).toEqual(['A.md', 'A.md'])
    })
})

describe('loading from the notes index', () => {
    const tree = [{ id: 'repo-1', uri: REPO_URI }]
    const buildIndexed = (listed) => ({
        sync: jest.fn(async () => {}),
        list: jest.fn(async () => listed)
    })
    const note = (name, updatedAt) => ({ path: `repo-1::${name}.md`, title: name, updatedAt })

    test('synchronizes the index before listing the notes of the tree', async () => {
        const indexed = buildIndexed([])
        const order = []
        indexed.sync.mockImplementation(async () => { order.push('sync') })
        indexed.list.mockImplementation(async () => { order.push('list'); return [] })

        await loadRepositoryData(tree, tree[0], createFakeStorage(), createFakeFileStorage(), [], undefined, indexed)

        expect(order).toEqual(['sync', 'list'])
        expect(indexed.sync).toHaveBeenCalledWith(tree)
        expect(indexed.list).toHaveBeenCalledWith(['repo-1'])
    })

    test('skips the listing when the synchronization found nothing new', async () => {
        const previous = [note('a', 1)]
        const indexed = buildIndexed([note('a', 2)])
        indexed.sync.mockResolvedValue(false)

        const { notes, changed } = await loadRepositoryData(
            tree, tree[0], createFakeStorage(), createFakeFileStorage(), previous, undefined, indexed
        )

        expect(indexed.list).not.toHaveBeenCalled()
        expect(notes).toBe(previous)
        expect(changed).toBe(false)
    })

    test('keeps the previous note objects whose modified time did not change', async () => {
        const previous = [note('a', 1), note('b', 1)]
        const indexed = buildIndexed([note('a', 1), note('b', 2)])

        const { notes, changed } = await loadRepositoryData(
            tree, tree[0], createFakeStorage(), createFakeFileStorage(), previous, undefined, indexed
        )

        expect(notes[0]).toBe(previous[0])
        expect(notes[1]).not.toBe(previous[1])
        expect(changed).toBe(true)
    })

    test('reports no change when the listing matches the previous notes', async () => {
        const previous = [note('a', 1), note('b', 1)]
        const indexed = buildIndexed([note('b', 1), note('a', 1)])

        const { changed } = await loadRepositoryData(
            tree, tree[0], createFakeStorage(), createFakeFileStorage(), previous, undefined, indexed
        )

        expect(changed).toBe(false)
    })

    test('reports a change when a note was added or removed', async () => {
        const previous = [note('a', 1)]

        const added = await loadRepositoryData(
            tree, tree[0], createFakeStorage(), createFakeFileStorage(), previous, undefined,
            buildIndexed([note('a', 1), note('c', 1)])
        )
        const removed = await loadRepositoryData(
            tree, tree[0], createFakeStorage(), createFakeFileStorage(), previous, undefined,
            buildIndexed([])
        )

        expect(added.changed).toBe(true)
        expect(removed.changed).toBe(true)
    })
})
