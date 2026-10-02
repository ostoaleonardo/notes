import { randomUUID } from 'expo-crypto'

import { getNoteKey } from '@/utils/note-key'
import { getUniqueFilename, stripNoteExtension } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'
import { buildNoteFileContent, parseFrontmatter } from '@/utils/frontmatter'
import { buildLegacyNoteBody } from '@/utils/legacy-note-body'

import { DEFAULT_TAGS, LEGACY_ALL_TAG_ID } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TAGS_FILENAME, METADATA_FILENAME } from '@/constants/file-storage'
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

// Legacy notes reference tags by id or by name; frontmatter needs unique names.
const resolveTagNames = (values, tagNameById) => {
    const names = values.map((value) => tagNameById.get(value) ?? value)
    return [...new Set(names)].filter((name) => name !== LEGACY_ALL_TAG_ID)
}

// Per-note entries -> .md files with embedded frontmatter.
const migrateStorageNotesToFiles = async (rootRepository, storage, fileStorage, tagNameById) => {
    const keys = await storage.getAllKeys()
    const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
    if (noteKeys.length === 0) return

    const entries = await storage.multiGet(noteKeys)
    const legacyNotes = entries.map(([, value]) => JSON.parse(value))

    const existingNames = fileStorage.listMarkdownFiles(rootRepository.uri).map((file) => file.name)
    const imagesUri = fileStorage.getOrCreateImagesFolder(rootRepository.uri).uri

    for (const note of legacyNotes) {
        const filename = getUniqueFilename(existingNames, note.title, null)
        existingNames.push(filename)

        const imageUris = await migrateLegacyImages(note.images || [], imagesUri, fileStorage)

        const tags = resolveTagNames(note.tags || note.categories || [], tagNameById)
        const content = buildNoteFileContent({ tags }, buildLegacyNoteBody(note, imageUris))

        fileStorage.writeNoteFile(rootRepository.uri, filename, content)
    }

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

        migrated[entry.filename] = { tags: entry.tags || [] }
        changed = true
    }

    return { metadata: migrated, changed }
}

// Old tags were {id, name} objects; frontmatter needs plain names.
const migrateTagsToNames = (tags) => {
    const names = []
    let changed = false

    for (const tag of tags) {
        if (typeof tag !== 'string') changed = true
        const name = typeof tag === 'string' ? tag : tag?.name
        if (!name || names.includes(name)) {
            if (names.includes(name)) changed = true
            continue
        }

        names.push(name)
    }

    return { tags: names, changed }
}

// Maps an old tag uuid to its name, for resolving note-level tag ids during the frontmatter migration.
const buildTagNameById = (rawTags) => {
    const map = new Map()
    for (const tag of rawTags) {
        if (tag && typeof tag === 'object' && tag.id) map.set(tag.id, tag.name)
    }
    return map
}

// Loads every folder in the tree and stamps each note with its identity path.
const loadFromTree = async (tree, loadFolder, fileStorage, tagNameById) => {
    const perFolder = await Promise.all(tree.map(async (repository) => {
        const items = await loadFolder(repository.uri, fileStorage, tagNameById)
        return items.map((item) => ({
            ...item,
            repositoryId: repository.id,
            path: buildNotePath(repository.id, item.filename)
        }))
    }))

    return perFolder.flat()
}

// Reconciles .md files against the metadata sidecar, migrating each note to embedded frontmatter.
const loadNotesFromFolder = async (repositoryUri, fileStorage, tagNameById) => {
    const files = fileStorage.listMarkdownFiles(repositoryUri)
    const rawMetadata = await fileStorage.readMetadata(repositoryUri)

    const { metadata, changed: keysMigrated } = migrateMetadataKeysToFilenames(rawMetadata)

    const fileNames = new Set(files.map((file) => file.name))
    let metadataChanged = keysMigrated
    let migrationFailed = false

    for (const filename of Object.keys(metadata)) {
        if (!fileNames.has(filename)) {
            delete metadata[filename]
            metadataChanged = true
        }
    }

    const notes = await Promise.all(files.map(async (file) => {
        const rawContent = await file.text()
        const { frontmatter, body, error, hasBlock, rawFrontmatter } = parseFrontmatter(rawContent)
        const createdAt = file.creationTime ?? file.lastModified
        const updatedAt = file.lastModified

        if (hasBlock) {
            if (metadata[file.name]) {
                delete metadata[file.name]
                metadataChanged = true
            }

            return {
                filename: file.name,
                title: getTitle(file.name),
                note: body,
                tags: frontmatter.tags || [],
                invalidFrontmatter: error ? rawFrontmatter : null,
                createdAt,
                updatedAt
            }
        }

        if (!metadata[file.name]) {
            metadata[file.name] = { tags: [] }
            metadataChanged = true
        }

        const entry = metadata[file.name]
        const tags = (entry.tags || []).map((id) => tagNameById.get(id)).filter(Boolean)

        try {
            const content = buildNoteFileContent({ tags }, body)
            fileStorage.writeNoteFile(repositoryUri, file.name, content)
            delete metadata[file.name]
            metadataChanged = true
        } catch (error) {
            console.debug('error migrating note to frontmatter', error)
            migrationFailed = true
        }

        return {
            filename: file.name,
            title: getTitle(file.name),
            note: body,
            tags,
            invalidFrontmatter: null,
            createdAt,
            updatedAt
        }
    }))

    if (metadataChanged) fileStorage.writeMetadata(repositoryUri, metadata)

    if (!migrationFailed && Object.keys(metadata).length === 0) {
        try {
            fileStorage.deleteNoteFile(repositoryUri, METADATA_FILENAME)
        } catch (error) {
            console.debug('error deleting migrated metadata sidecar', error)
        }
    }

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

// Drops the legacy 'all' pseudo-tag, before or after the id -> name migration.
const purgeAllTag = (tags, repositoryUri, fileStorage) => {
    const filtered = tags.filter((tag) => (
        typeof tag === 'string' ? tag !== LEGACY_ALL_TAG_ID : tag.id !== LEGACY_ALL_TAG_ID
    ))
    if (filtered.length !== tags.length) fileStorage.writeJson(repositoryUri, TAGS_FILENAME, filtered)
    return filtered
}

// Tags are always read/written at the root, shared across the whole tree.
export const loadRepositoryData = async (tree, rootRepository, storage, fileStorage) => {
    const rootRepositoryUri = rootRepository.uri

    await migrateLegacyBlobNotes(storage)

    const rawTags = await loadSidecarList({
        repositoryUri: rootRepositoryUri,
        filename: TAGS_FILENAME,
        legacyKey: STORAGE_KEYS.CATEGORIES,
        defaultValue: DEFAULT_TAGS,
        storage,
        fileStorage
    })

    const purgedRawTags = purgeAllTag(rawTags, rootRepositoryUri, fileStorage)
    const tagNameById = buildTagNameById(purgedRawTags)

    await migrateStorageNotesToFiles(
        rootRepository,
        storage,
        fileStorage,
        tagNameById
    )

    const { tags, changed: tagsMigrated } = migrateTagsToNames(purgedRawTags)
    if (tagsMigrated) fileStorage.writeJson(rootRepositoryUri, TAGS_FILENAME, tags)

    const notes = await loadFromTree(tree, loadNotesFromFolder, fileStorage, tagNameById)

    return { notes, tags }
}
