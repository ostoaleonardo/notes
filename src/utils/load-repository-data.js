import { randomUUID } from 'expo-crypto'

import { getNoteKey } from '@/utils/note-key'
import { getUniqueFilename, stripNoteExtension } from '@/utils/note-filename'
import { buildNotePath, buildRepositoryPaths } from '@/utils/note-path'
import {
    buildNoteFileContent,
    extractProperties,
    readFrontmatterTags,
    parseFrontmatter
} from '@/utils/frontmatter'
import { buildLegacyNoteBody } from '@/utils/legacy-note-body'

import { LEGACY_ALL_TAG_ID } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { TAGS_FILENAME, LEGACY_TAGS_FILENAME, TEMPLATES_FOLDER_NAME } from '@/constants/file-storage'
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
    const names = values
        .filter((value) => value !== LEGACY_ALL_TAG_ID)
        .map((value) => tagNameById.get(value) ?? value)

    return [...new Set(names)]
}

// Legacy tag dictionaries (id -> name) are only read to resolve ids while migrating old notes.
const loadLegacyTagNameById = async (rootUri, storage, fileStorage) => {
    const stored = await fileStorage.readNotesJson(rootUri, TAGS_FILENAME, null)
        ?? await fileStorage.readJson(rootUri, LEGACY_TAGS_FILENAME, null)
        ?? JSON.parse(await storage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')

    const map = new Map()
    for (const tag of stored) {
        if (tag && typeof tag === 'object' && tag.id) map.set(tag.id, tag.name)
    }

    return map
}

// Per-note entries -> .md files with embedded frontmatter.
const migrateStorageNotesToFiles = async (rootRepository, storage, fileStorage, loadTagNameById) => {
    const keys = await storage.getAllKeys()
    const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
    const report = { renamedNotes: 0, failedImages: 0 }
    if (noteKeys.length === 0) return report

    const entries = await storage.multiGet(noteKeys)
    const tagNameById = await loadTagNameById()

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
            tags: readFrontmatterTags(frontmatter),
            properties: extractProperties(frontmatter),
            invalidFrontmatter: error ? rawFrontmatter : null,
            createdAt: file.creationTime ?? file.lastModified,
            updatedAt: file.lastModified
        }
    }))
}

const migrateLegacyVersionFiles = async (tree, rootUri, storage, fileStorage) => {
    const migratedKey = STORAGE_KEYS.LEGACY_VERSIONS_MIGRATED_PREFIX + rootUri
    if (await storage.getItem(migratedKey)) return

    const folderPaths = buildRepositoryPaths(tree)

    for (const repository of tree) {
        await fileStorage.migrateLegacyVersions(repository.uri, rootUri, folderPaths.get(repository.id) || '')
    }

    const templates = fileStorage.findDirectory(rootUri, TEMPLATES_FOLDER_NAME)
    if (templates) await fileStorage.migrateLegacyVersions(templates.uri, rootUri, TEMPLATES_FOLDER_NAME)

    await storage.setItem(migratedKey, 'true')
}

// Version history lives in the root .notes folder, shared across the whole tree.
export const loadRepositoryData = async (tree, rootRepository, storage, fileStorage) => {
    const rootUri = rootRepository.uri

    await migrateLegacyBlobNotes(storage)

    const migration = await migrateStorageNotesToFiles(
        rootRepository,
        storage,
        fileStorage,
        () => loadLegacyTagNameById(rootUri, storage, fileStorage)
    )

    await migrateLegacyVersionFiles(tree, rootUri, storage, fileStorage)

    const notes = await loadFromTree(tree, loadNotesFromFolder, fileStorage)

    return { notes, migration }
}
