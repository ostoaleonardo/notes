import { randomUUID } from 'expo-crypto'
import { CATEGORIES_FILENAME, TRASH_FILENAME } from '../hooks/use-file-storage'
import { DEFAULT_CATEGORIES, DEFAULT_NOTE_CATEGORIES, STORAGE_KEYS } from '@/constants'
import { getNoteKey, getUniqueFilename, NOTE_KEY_PREFIX } from '@/utils'

const getTitle = (filename) => filename.replace(/\.md$/i, '')

// One-time migration: a single AsyncStorage blob of all notes -> one AsyncStorage entry per note.
const migrateLegacyBlobNotes = async (storage) => {
    const legacy = await storage.getItem(STORAGE_KEYS.NOTES)
    if (!legacy) return

    const legacyNotes = JSON.parse(legacy)
    await storage.multiSet(legacyNotes.map((note) => [getNoteKey(note.id), JSON.stringify(note)]))
    await storage.removeItem(STORAGE_KEYS.NOTES)
}

// One-time migration: per-note AsyncStorage entries -> .md files in the active repository.
const migrateStorageNotesToFiles = async (repositoryUri, storage, fileStorage) => {
    const keys = await storage.getAllKeys()
    const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
    if (noteKeys.length === 0) return

    const entries = await storage.multiGet(noteKeys)
    const legacyNotes = entries.map(([, value]) => JSON.parse(value))

    const metadata = await fileStorage.readMetadata(repositoryUri)
    const existingNames = fileStorage.listMarkdownFiles(repositoryUri).map((file) => file.name)

    for (const note of legacyNotes) {
        const filename = getUniqueFilename(existingNames, note.title, null)
        existingNames.push(filename)

        fileStorage.writeNoteFile(repositoryUri, filename, note.note || '')
        metadata[note.id] = {
            filename,
            categories: note.categories || DEFAULT_NOTE_CATEGORIES,
            password: note.password || '',
            biometrics: note.biometrics || false,
            createdAt: note.createdAt || Date.now(),
            updatedAt: note.updatedAt || '',
            images: note.images || []
        }
    }

    fileStorage.writeMetadata(repositoryUri, metadata)
    await storage.multiRemove(noteKeys)
}

// Scans the repository's .md files, reconciling them against the metadata sidecar
// (adopting foreign files, pruning entries for files that were removed externally).
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
                categories: DEFAULT_NOTE_CATEGORIES,
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
            categories: entry.categories,
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

// Reads a repository sidecar list (categories/trash), migrating a legacy global
// AsyncStorage value into it the first time the repository is loaded.
const loadSidecarList = async ({ repositoryUri, filename, legacyKey, defaultValue, normalizeLegacy = (value) => value, storage, fileStorage }) => {
    const existing = await fileStorage.readJson(repositoryUri, filename, null)
    if (existing) return existing

    const legacy = await storage.getItem(legacyKey)
    const value = legacy ? normalizeLegacy(JSON.parse(legacy)) : defaultValue

    fileStorage.writeJson(repositoryUri, filename, value)
    if (legacy) await storage.removeItem(legacyKey)

    return value
}

export const loadRepositoryData = async (repository, storage, fileStorage) => {
    const repositoryUri = repository.uri

    await migrateLegacyBlobNotes(storage)
    await migrateStorageNotesToFiles(repositoryUri, storage, fileStorage)

    const notes = await loadNotesFromFolder(repositoryUri, fileStorage)

    const categories = await loadSidecarList({
        repositoryUri,
        filename: CATEGORIES_FILENAME,
        legacyKey: STORAGE_KEYS.CATEGORIES,
        defaultValue: DEFAULT_CATEGORIES,
        storage,
        fileStorage
    })

    const trash = await loadSidecarList({
        repositoryUri,
        filename: TRASH_FILENAME,
        legacyKey: STORAGE_KEYS.TRASH,
        defaultValue: [],
        normalizeLegacy: (parsed) => (Array.isArray(parsed) ? parsed : Object.values(parsed)),
        storage,
        fileStorage
    })

    return { notes, categories, trash }
}
