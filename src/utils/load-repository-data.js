import { randomUUID } from 'expo-crypto'

import { getNoteKey } from '@/utils/note-key'
import { getUniqueFilename, stripNoteExtension } from '@/utils/note-filename'
import { buildNotePath, buildRepositoryPaths } from '@/utils/note-path'
import { reconcileTags } from '@/utils/tag-names'
import {
    buildNoteFileContent,
    extractProperties,
    normalizeTags,
    parseFrontmatter
} from '@/utils/frontmatter'
import { buildLegacyNoteBody } from '@/utils/legacy-note-body'

import { DEFAULT_TAGS, LEGACY_ALL_TAG_ID } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TAGS_FILENAME, LEGACY_TAGS_FILENAME } from '@/constants/file-storage'
import { DEFAULT_IMAGE_EXTENSION, IMAGE_EXTENSION_PATTERN } from '@/constants/image'
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
    let failed = 0

    for (const uri of images) {
        try {
            const extension = (uri.match(IMAGE_EXTENSION_PATTERN) || [])[1] || DEFAULT_IMAGE_EXTENSION
            const file = await fileStorage.copyImageFile(uri, imagesUri, `${randomUUID()}.${extension}`)
            migrated.push(file.uri)
        } catch (error) {
            console.debug('error migrating legacy note image', error)
            failed++
        }
    }

    return { migrated, failed }
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
    const report = { renamedNotes: 0, failedImages: 0 }
    if (noteKeys.length === 0) return report

    const entries = await storage.multiGet(noteKeys)

    const existingNames = fileStorage.listMarkdownFiles(rootRepository.uri).map((file) => file.name)
    const imagesUri = fileStorage.getOrCreateImagesFolder(rootRepository.uri).uri

    for (const [key, value] of entries) {
        const note = JSON.parse(value)
        const filename = getUniqueFilename(existingNames, note.title, null)
        existingNames.push(filename)
        if (filename !== getUniqueFilename([], note.title, null)) report.renamedNotes++

        const { migrated: imageUris, failed } = await migrateLegacyImages(note.images || [], imagesUri, fileStorage)
        report.failedImages += failed

        const tags = resolveTagNames(note.tags || note.categories || [], tagNameById)
        const content = buildNoteFileContent({ tags }, buildLegacyNoteBody(note, imageUris))

        fileStorage.writeNoteFile(rootRepository.uri, filename, content)
        await storage.removeItem(key)
    }

    return report
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

const loadNotesFromFolder = async (repositoryUri, fileStorage) => {
    const files = fileStorage.listMarkdownFiles(repositoryUri)

    return Promise.all(files.map(async (file) => {
        const { frontmatter, body, error, rawFrontmatter } = parseFrontmatter(await file.text())

        return {
            filename: file.name,
            title: getTitle(file.name),
            note: body,
            tags: normalizeTags(frontmatter.tags),
            properties: extractProperties(frontmatter),
            invalidFrontmatter: error ? rawFrontmatter : null,
            createdAt: file.creationTime ?? file.lastModified,
            updatedAt: file.lastModified
        }
    }))
}

// Reads tags from .notes, migrating the root .tags.json and the AsyncStorage value once.
const loadTags = async (rootUri, storage, fileStorage) => {
    const existing = await fileStorage.readNotesJson(rootUri, TAGS_FILENAME, null)
    if (existing) return existing

    const legacyFile = await fileStorage.readJson(rootUri, LEGACY_TAGS_FILENAME, null)
    if (legacyFile) {
        fileStorage.writeNotesJson(rootUri, TAGS_FILENAME, legacyFile)
        fileStorage.deleteNoteFile(rootUri, LEGACY_TAGS_FILENAME)
        return legacyFile
    }

    const legacy = await storage.getItem(STORAGE_KEYS.CATEGORIES)
    const value = legacy ? JSON.parse(legacy) : DEFAULT_TAGS

    fileStorage.writeNotesJson(rootUri, TAGS_FILENAME, value)
    if (legacy) await storage.removeItem(STORAGE_KEYS.CATEGORIES)

    return value
}

// Drops the legacy 'all' pseudo-tag, before or after the id -> name migration.
const purgeAllTag = (tags, rootUri, fileStorage) => {
    const filtered = tags.filter((tag) => (
        typeof tag === 'string' ? tag !== LEGACY_ALL_TAG_ID : tag.id !== LEGACY_ALL_TAG_ID
    ))
    if (filtered.length !== tags.length) fileStorage.writeNotesJson(rootUri, TAGS_FILENAME, filtered)
    return filtered
}

const migrateLegacyVersionFiles = async (tree, rootUri, fileStorage) => {
    const folderPaths = buildRepositoryPaths(tree)

    for (const repository of tree) {
        await fileStorage.migrateLegacyVersions(repository.uri, rootUri, folderPaths.get(repository.id) || '')
    }
}

// Tags and version history live in the root .notes folder, shared across the whole tree.
export const loadRepositoryData = async (tree, rootRepository, storage, fileStorage) => {
    const rootUri = rootRepository.uri

    await migrateLegacyBlobNotes(storage)

    const rawTags = await loadTags(rootUri, storage, fileStorage)
    const purgedRawTags = purgeAllTag(rawTags, rootUri, fileStorage)
    const tagNameById = buildTagNameById(purgedRawTags)

    const migration = await migrateStorageNotesToFiles(
        rootRepository,
        storage,
        fileStorage,
        tagNameById
    )

    const { tags: namedTags, changed: tagsMigrated } = migrateTagsToNames(purgedRawTags)
    if (tagsMigrated) fileStorage.writeNotesJson(rootUri, TAGS_FILENAME, namedTags)

    await migrateLegacyVersionFiles(tree, rootUri, fileStorage)

    const notes = await loadFromTree(tree, loadNotesFromFolder, fileStorage)

    const { tags, changed: tagsReconciled } = reconcileTags(namedTags, notes)
    if (tagsReconciled) fileStorage.writeNotesJson(rootUri, TAGS_FILENAME, tags)

    return { notes, tags, migration }
}
