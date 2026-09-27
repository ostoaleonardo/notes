import { randomUUID } from 'expo-crypto'

import { getNoteKey } from '@/utils/note-key'
import { getUniqueFilename, stripNoteExtension } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'

import { DEFAULT_TAGS } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TAGS_FILENAME } from '@/constants/file-storage'
import { NOTE_KEY_PREFIX } from '@/constants/note-key'

const getTitle = stripNoteExtension

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
        metadata[filename] = {
            tags: note.tags || note.categories || [],
            createdAt: note.createdAt || Date.now(),
            updatedAt: note.updatedAt || '',
            images: await migrateLegacyImages(note.images || [], imagesUri, fileStorage)
        }
    }

    fileStorage.writeMetadata(repositoryUri, metadata)
    await storage.multiRemove(noteKeys)
}

// Old metadata was keyed by a random note id, with the filename stored inside the entry.
const migrateMetadataKeysToFilenames = (metadata) => {
    let changed = false
    const migrated = {}

    for (const [key, entry] of Object.entries(metadata)) {
        if (!entry.filename) {
            migrated[key] = entry
            continue
        }

        migrated[entry.filename] = {
            tags: entry.tags || [],
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt || '',
            images: entry.images || []
        }
        changed = true
    }

    return { metadata: migrated, changed }
}

// Loads every folder in the tree and stamps each note with its identity path.
const loadFromTree = async (tree, loadFolder, fileStorage) => {
    const perFolder = await Promise.all(tree.map(async (repository) => {
        const items = await loadFolder(repository.uri, fileStorage)
        return items.map((item) => ({
            ...item,
            repositoryId: repository.id,
            path: buildNotePath(repository.id, item.filename)
        }))
    }))

    return perFolder.flat()
}

// Reconciles .md files against the metadata sidecar.
const loadNotesFromFolder = async (repositoryUri, fileStorage) => {
    const files = fileStorage.listMarkdownFiles(repositoryUri)
    const rawMetadata = await fileStorage.readMetadata(repositoryUri)

    const { metadata, changed: keysMigrated } = migrateMetadataKeysToFilenames(rawMetadata)

    const fileNames = new Set(files.map((file) => file.name))
    let metadataChanged = keysMigrated

    for (const filename of Object.keys(metadata)) {
        if (!fileNames.has(filename)) {
            delete metadata[filename]
            metadataChanged = true
        }
    }

    const notes = await Promise.all(files.map(async (file) => {
        if (!metadata[file.name]) {
            metadata[file.name] = {
                tags: [],
                createdAt: Date.now(),
                updatedAt: '',
                images: []
            }
            metadataChanged = true
        }

        const entry = metadata[file.name]
        const content = await file.text()

        return {
            filename: file.name,
            title: getTitle(file.name),
            note: content,
            tags: entry.tags || [],
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            images: entry.images || []
        }
    }))

    if (metadataChanged) fileStorage.writeMetadata(repositoryUri, metadata)

    return notes
}

// Reads a sidecar list (tags), migrating its legacy AsyncStorage value once.
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

// Tags are always read/written at the root, shared across the whole tree.
export const loadRepositoryData = async (tree, rootRepository, storage, fileStorage) => {
    const rootRepositoryUri = rootRepository.uri

    await migrateLegacyBlobNotes(storage)
    await migrateStorageNotesToFiles(rootRepositoryUri, rootRepositoryUri, storage, fileStorage)

    const notes = await loadFromTree(tree, loadNotesFromFolder, fileStorage)

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

    return { notes, tags }
}
