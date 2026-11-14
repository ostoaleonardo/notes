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
import { NOTE_READ_BATCH_SIZE, TEMPLATES_FOLDER_NAME } from '@/constants/file-storage'
import { DEFAULT_IMAGE_EXTENSION, IMAGE_EXTENSION_PATTERN } from '@/constants/image'
import { NOTE_KEY_PREFIX } from '@/constants/note-key'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

const getTitle = stripNoteExtension

const migrateLegacyBlobNotes = async (storage) => {
    const legacy = await storage.getItem(STORAGE_KEYS.NOTES)
    if (!legacy) return

    const legacyNotes = JSON.parse(legacy)
    await storage.multiSet(legacyNotes.map((note) => [getNoteKey(note.id), JSON.stringify(note)]))
    await storage.removeItem(STORAGE_KEYS.NOTES)
}

const migrateLegacyImages = async (images, imagesUri, fileStorage) => {
    const migrated = []
    let failed = 0

    for (const uri of images) {
        try {
            const extension = (uri.match(IMAGE_EXTENSION_PATTERN) || [])[1] || DEFAULT_IMAGE_EXTENSION
            const file = await fileStorage.copyImageFile(uri, imagesUri, `${randomUUID()}.${extension}`)
            migrated.push(file.uri)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_MIGRATING_LEGACY_NOTE_IMAGE, error)
            failed++
        }
    }

    return { migrated, failed }
}

const resolveTagNames = (values, tagNameById) => {
    const names = values
        .filter((value) => value !== LEGACY_ALL_TAG_ID)
        .map((value) => tagNameById.get(value) ?? value)

    return [...new Set(names)]
}

const loadLegacyTagNameById = async (storage) => {
    const stored = JSON.parse(await storage.getItem(STORAGE_KEYS.CATEGORIES) || '[]')

    const map = new Map()
    for (const tag of stored) {
        if (tag && typeof tag === 'object' && tag.id) map.set(tag.id, tag.name)
    }

    return map
}

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

const scanFolder = async (repository, fileStorage) => {
    const files = await fileStorage.scanMarkdownFiles(repository.uri)

    return files.map((file) => ({
        file,
        repositoryId: repository.id,
        path: buildNotePath(repository.id, file.name)
    }))
}

const buildNote = ({ file, repositoryId, path }, content) => {
    const { frontmatter, body, error, rawFrontmatter } = parseFrontmatter(content)

    return {
        filename: file.name,
        repositoryId,
        path,
        fileUri: file.uri,
        title: getTitle(file.name),
        note: body,
        tags: readFrontmatterTags(frontmatter),
        properties: extractProperties(frontmatter),
        invalidFrontmatter: error ? rawFrontmatter : null,
        rawFrontmatter: error ? null : rawFrontmatter ?? null,
        createdAt: file.lastModified,
        updatedAt: file.lastModified
    }
}

const readChangedNotes = async (changed, fileStorage, onProgress) => {
    const notesByPath = new Map()
    if (changed.length) onProgress?.(0, changed.length)

    for (let start = 0; start < changed.length; start += NOTE_READ_BATCH_SIZE) {
        const batch = changed.slice(start, start + NOTE_READ_BATCH_SIZE)
        const contents = await fileStorage.readTextFiles(batch.map((entry) => entry.file.uri))

        batch.forEach((entry, index) => {
            if (contents[index] != null) notesByPath.set(entry.path, buildNote(entry, contents[index]))
        })

        onProgress?.(start + batch.length, changed.length)
    }

    return notesByPath
}

const loadNotes = async (tree, fileStorage, previousNotes, onProgress) => {
    const previousByPath = new Map(previousNotes.map((note) => [note.path, note]))
    const scanned = (await Promise.all(tree.map((repository) => scanFolder(repository, fileStorage)))).flat()

    const changed = scanned.filter(({ file, path }) => (
        previousByPath.get(path)?.updatedAt !== file.lastModified
    ))
    const readByPath = await readChangedNotes(changed, fileStorage, onProgress)

    const notes = scanned
        .map(({ path }) => readByPath.get(path) ?? previousByPath.get(path))
        .filter(Boolean)

    return {
        notes,
        changed: changed.length > 0 || notes.length !== previousNotes.length
    }
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

export const loadRepositoryData = async (
    tree,
    rootRepository,
    storage,
    fileStorage,
    previousNotes = [],
    onProgress
) => {
    const rootUri = rootRepository.uri

    await migrateLegacyBlobNotes(storage)

    const migration = await migrateStorageNotesToFiles(
        rootRepository,
        storage,
        fileStorage,
        () => loadLegacyTagNameById(storage)
    )

    await migrateLegacyVersionFiles(tree, rootUri, storage, fileStorage)

    const { notes, changed } = await loadNotes(tree, fileStorage, previousNotes, onProgress)

    return { notes, changed, migration }
}
