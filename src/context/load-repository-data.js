import { randomUUID } from 'expo-crypto'
import { getNoteKey } from '@/utils/note-key'
import { getUniqueFilename } from '@/utils/note-filename'
import {
    DEFAULT_TAGS,
    STORAGE_KEYS,
    TAGS_FILENAME,
    TRASH_FILENAME,
    TRASH_RETENTION_MS,
    NOTE_KEY_PREFIX
} from '@/constants'

const getTitle = (filename) => filename.replace(/\.md$/i, '')

// Legacy blob -> per-note AsyncStorage entries.
const migrateLegacyBlobNotes = async (storage) => {
    const legacy = await storage.getItem(STORAGE_KEYS.NOTES)
    if (!legacy) return

    const legacyNotes = JSON.parse(legacy)
    await storage.multiSet(legacyNotes.map((note) => [getNoteKey(note.id), JSON.stringify(note)]))
    await storage.removeItem(STORAGE_KEYS.NOTES)
}

// Legacy cache images -> images/.
const migrateLegacyImages = async (images, imagesUri, fileStorage) => {
    const migrated = []

    for (const uri of images) {
        try {
            const extension = (uri.match(/\.(\w+)$/) || [])[1] || 'jpg'
            const file = await fileStorage.copyImageFile(uri, imagesUri, `${randomUUID()}.${extension}`)
            migrated.push(file.uri)
        } catch (error) {
            console.debug('error migrating legacy note image', error)
        }
    }

    return migrated
}

// Per-note entries -> .md files.
const migrateStorageNotesToFiles = async (repositoryUri, rootRepositoryUri, storage, fileStorage) => {
    const keys = await storage.getAllKeys()
    const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
    if (noteKeys.length === 0) return

    const entries = await storage.multiGet(noteKeys)
    const legacyNotes = entries.map(([, value]) => JSON.parse(value))

    const metadata = await fileStorage.readMetadata(repositoryUri)
    const existingNames = fileStorage.listMarkdownFiles(repositoryUri).map((file) => file.name)
    const imagesUri = fileStorage.getOrCreateImagesFolder(rootRepositoryUri).uri

    for (const note of legacyNotes) {
        const filename = getUniqueFilename(existingNames, note.title, null)
        existingNames.push(filename)

        fileStorage.writeNoteFile(repositoryUri, filename, note.note || '')
        metadata[note.id] = {
            filename,
            tags: note.tags || note.categories || [],
            password: note.password || '',
            biometrics: note.biometrics || false,
            createdAt: note.createdAt || Date.now(),
            updatedAt: note.updatedAt || '',
            images: await migrateLegacyImages(note.images || [], imagesUri, fileStorage)
        }
    }

    fileStorage.writeMetadata(repositoryUri, metadata)
    await storage.multiRemove(noteKeys)
}

// Reconciles .md files against the metadata sidecar.
const loadNotesFromFolder = async (repositoryUri, fileStorage) => {
    const files = fileStorage.listMarkdownFiles(repositoryUri)
    const metadata = await fileStorage.readMetadata(repositoryUri)

    const fileNames = new Set(files.map((file) => file.name))
    let metadataChanged = false

    for (const id of Object.keys(metadata)) {
        if (!fileNames.has(metadata[id].filename)) {
            delete metadata[id]
            metadataChanged = true
        }
    }

    const filenameToId = new Map(
        Object.entries(metadata).map(([id, entry]) => [entry.filename, id])
    )

    const notes = await Promise.all(files.map(async (file) => {
        let id = filenameToId.get(file.name)

        if (!id) {
            id = randomUUID()
            metadata[id] = {
                filename: file.name,
                tags: [],
                password: '',
                biometrics: false,
                createdAt: Date.now(),
                updatedAt: '',
                images: []
            }
            metadataChanged = true
        }

        const entry = metadata[id]
        const content = await file.text()

        return {
            id,
            title: getTitle(file.name),
            note: content,
            tags: entry.tags || [],
            password: entry.password,
            biometrics: entry.biometrics,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            images: entry.images || []
        }
    }))

    if (metadataChanged) fileStorage.writeMetadata(repositoryUri, metadata)

    return notes
}

// Reads a sidecar list (tags/trash), migrating its legacy AsyncStorage value once.
const loadSidecarList = async ({ repositoryUri, filename, legacyKey, defaultValue, normalizeLegacy = (value) => value, storage, fileStorage }) => {
    const existing = await fileStorage.readJson(repositoryUri, filename, null)
    if (existing) return existing

    const legacy = await storage.getItem(legacyKey)
    const value = legacy ? normalizeLegacy(JSON.parse(legacy)) : defaultValue

    fileStorage.writeJson(repositoryUri, filename, value)
    if (legacy) await storage.removeItem(legacyKey)

    return value
}

// Drops the legacy 'all' pseudo-tag.
const purgeAllTag = (tags, repositoryUri, fileStorage) => {
    const filtered = tags.filter((tag) => tag.id !== 'all')
    if (filtered.length !== tags.length) fileStorage.writeJson(repositoryUri, TAGS_FILENAME, filtered)
    return filtered
}

// Backfills trashedAt on older entries, then drops anything past TRASH_RETENTION_DAYS.
const purgeExpiredTrash = (trash, repositoryUri, fileStorage) => {
    const now = Date.now()
    let changed = false

    const stamped = trash.map((item) => {
        if (item.trashedAt) return item
        changed = true
        return { ...item, trashedAt: now }
    })

    const kept = stamped.filter((item) => now - item.trashedAt < TRASH_RETENTION_MS)
    if (kept.length !== stamped.length) changed = true

    if (changed) fileStorage.writeJson(repositoryUri, TRASH_FILENAME, kept)

    return kept
}

// Tags are always read/written at the root, shared across the whole tree.
export const loadRepositoryData = async (repository, rootRepository, storage, fileStorage) => {
    const repositoryUri = repository.uri
    const rootRepositoryUri = rootRepository.uri

    await migrateLegacyBlobNotes(storage)
    await migrateStorageNotesToFiles(repositoryUri, rootRepositoryUri, storage, fileStorage)

    const notes = await loadNotesFromFolder(repositoryUri, fileStorage)

    const tags = purgeAllTag(
        await loadSidecarList({
            repositoryUri: rootRepositoryUri,
            filename: TAGS_FILENAME,
            legacyKey: STORAGE_KEYS.CATEGORIES,
            defaultValue: DEFAULT_TAGS,
            storage,
            fileStorage
        }),
        rootRepositoryUri,
        fileStorage
    )

    const rawTrash = await loadSidecarList({
        repositoryUri,
        filename: TRASH_FILENAME,
        legacyKey: STORAGE_KEYS.TRASH,
        defaultValue: [],
        normalizeLegacy: (parsed) => (Array.isArray(parsed) ? parsed : Object.values(parsed)),
        storage,
        fileStorage
    })

    const trash = purgeExpiredTrash(rawTrash, repositoryUri, fileStorage)

    return { notes, tags, trash }
}
