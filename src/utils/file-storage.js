import { Directory, File, FileMode, Paths } from 'expo-file-system'

import RepositoryFs from 'repository-fs'

import { getUniqueFilenameBy, stripNoteExtension } from '@/utils/note-filename'
import { buildVersionKey } from '@/utils/note-version-location'
import { invalidateMediaIndex } from '@/utils/media-index'
import { getNoteLinkTexts, seedNoteLinkTexts } from '@/utils/note-links'
import { getNoteTags, seedNoteTags } from '@/utils/note-tags'

import {
    NOTE_FILE_EXTENSION,
    VERSIONS_FILENAME_SUFFIX,
    TEMPLATES_FOLDER_NAME,
    IMAGES_FOLDER_NAME,
    VAULT_TRASH_FOLDER_NAME,
    NOTES_FOLDER_NAME,
    RESERVED_FOLDER_NAMES,
    CORRUPT_FILE_SUFFIX,
    WRITE_ATTEMPTS,
    REPOSITORY_INDEX_FOLDER_NAME,
    REPOSITORY_INDEX_VERSION
} from '@/constants/file-storage'
import { MIME_TYPES } from '@/constants/mime-types'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from './log-error'

const listEntries = (directoryUri) => RepositoryFs.listDirectorySync(directoryUri)

const isMarkdownFile = (entry) => (
    !entry.isDirectory &&
    entry.name.toLowerCase().endsWith(NOTE_FILE_EXTENSION)
)

const isNoteFolder = (entry) => (
    entry.isDirectory &&
    !entry.name.startsWith('.') &&
    !RESERVED_FOLDER_NAMES.includes(entry.name)
)

const findChild = (directoryUri, name) => RepositoryFs.findChild(directoryUri, name)

const fileExists = (directoryUri, filename) => {
    const entry = findChild(directoryUri, filename)

    return !!entry && !entry.isDirectory
}

const findFile = (directoryUri, filename) => {
    const entry = findChild(directoryUri, filename)

    return entry && !entry.isDirectory ? new File(entry.uri) : undefined
}

const getExistingFile = (fileUri) => {
    if (!fileUri) return undefined

    const file = new File(fileUri)
    return file.exists ? file : undefined
}

const findDirectory = (directoryUri, name) => {
    const entry = findChild(directoryUri, name)

    return entry?.isDirectory ? new Directory(entry.uri) : undefined
}

const createSubdirectory = (directoryUri, name) => (
    new Directory(directoryUri).createDirectory(name)
)

const getOrCreateTemplatesFolder = (directoryUri) => (
    findDirectory(directoryUri, TEMPLATES_FOLDER_NAME) || createSubdirectory(directoryUri, TEMPLATES_FOLDER_NAME)
)

const getOrCreateImagesFolder = (directoryUri) => (
    findDirectory(directoryUri, IMAGES_FOLDER_NAME) || createSubdirectory(directoryUri, IMAGES_FOLDER_NAME)
)

const getOrCreateVaultTrashFolder = (directoryUri) => (
    findDirectory(directoryUri, VAULT_TRASH_FOLDER_NAME) || createSubdirectory(directoryUri, VAULT_TRASH_FOLDER_NAME)
)

const getOrCreateNotesFolder = (directoryUri) => (
    findDirectory(directoryUri, NOTES_FOLDER_NAME) || createSubdirectory(directoryUri, NOTES_FOLDER_NAME)
)

const listMarkdownFiles = (directoryUri) => listEntries(directoryUri).filter(isMarkdownFile)

const listSubdirectories = (directoryUri) => listEntries(directoryUri).filter(isNoteFolder)

const pendingScans = new Map()

const toEntries = ({ uris, names, directories, lastModified, sizes }) => names.map((name, index) => ({
    uri: uris[index],
    name,
    isDirectory: directories[index],
    lastModified: lastModified[index],
    size: sizes[index]
}))

const scanEntries = (directoryUri) => {
    if (!pendingScans.has(directoryUri)) {
        const scan = RepositoryFs.listDirectory(directoryUri)
            .then(toEntries)
            .finally(() => pendingScans.delete(directoryUri))
        pendingScans.set(directoryUri, scan)
    }

    return pendingScans.get(directoryUri)
}

const scanMarkdownFiles = async (directoryUri) => (await scanEntries(directoryUri)).filter(isMarkdownFile)

const scanSubdirectories = async (directoryUri) => (await scanEntries(directoryUri)).filter(isNoteFolder)

const readTextFiles = (fileUris) => RepositoryFs.readTextFiles(fileUris)

const scanAttachments = async (rootUri) => {
    const { uris, names, folders } = await RepositoryFs.listAttachments(rootUri)

    return names.map((filename, index) => ({ filename, uri: uris[index], folder: folders[index] }))
}

const deleteDirectory = (directoryUri) => {
    new Directory(directoryUri).delete()
    invalidateMediaIndex()
}

const directoryExists = (directoryUri) => new Directory(directoryUri).exists

const copyDirectoryContents = async (source, destination) => {
    for (const entry of source.list()) {
        if (entry instanceof Directory) {
            await copyDirectoryContents(entry, destination.createDirectory(entry.name))
        } else {
            destination.createFile(entry.name, entry.type || null).write(await entry.bytes())
        }
    }
}

const renameDirectory = async (directoryUri, parentUri, newName) => {
    const directory = new Directory(directoryUri)
    const newDirectory = new Directory(parentUri).createDirectory(newName)

    try {
        await copyDirectoryContents(directory, newDirectory)
    } catch (error) {
        newDirectory.delete()
        throw error
    }

    directory.delete()
    invalidateMediaIndex()

    return newDirectory.uri
}

const copyImageFile = async (sourceUri, directoryUri, filename) => {
    const source = new File(sourceUri)
    const bytes = await source.bytes()
    const file = new Directory(directoryUri).createFile(filename, source.type || MIME_TYPES.JPEG)
    file.write(bytes)
    invalidateMediaIndex()
    return file
}

const writeVerified = (file, content) => {
    const bytes = new TextEncoder().encode(content)

    for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt++) {
        const handle = file.open(FileMode.Truncate)
        try {
            handle.writeBytesSync(bytes)
        } finally {
            handle.close()
        }

        const size = file.size
        if (size == null || size === bytes.length) return
    }

    throw new Error(`write verification failed for ${file.name}`)
}

const writeNoteFile = (
    directoryUri,
    filename,
    content,
    mimeType = MIME_TYPES.MARKDOWN,
    existing = findFile(directoryUri, filename)
) => {
    const file = existing || new Directory(directoryUri).createFile(filename, mimeType)
    writeVerified(file, content)
    return file
}

const renameNoteFile = async (directoryUri, oldFilename, newFilename) => {
    const file = findFile(directoryUri, oldFilename)
    if (!file) return

    const content = await file.text()
    writeNoteFile(directoryUri, newFilename, content)
    file.delete()
}

const deleteNoteFile = (directoryUri, filename) => {
    const file = findFile(directoryUri, filename)
    if (file) file.delete()
}

const moveNoteFiles = async (sourceUri, filename, destinationUri) => {
    const source = findFile(sourceUri, filename)
    const target = getUniqueFilenameBy(
        (name) => fileExists(destinationUri, name),
        stripNoteExtension(filename),
        null
    )

    writeNoteFile(destinationUri, target, await source.text())
    source.delete()

    return target
}

const readJson = async (directoryUri, filename, fallback) => {
    const file = findFile(directoryUri, filename)
    if (!file) return fallback

    const text = await file.text()

    try {
        return JSON.parse(text)
    } catch (error) {
        logError(LOG_MESSAGES.PARSING_JSON_FILE(filename), error)
        writeNoteFile(directoryUri, filename + CORRUPT_FILE_SUFFIX, text, MIME_TYPES.JSON)
        return fallback
    }
}

const writeJson = (directoryUri, filename, data) => {
    writeNoteFile(directoryUri, filename, JSON.stringify(data), MIME_TYPES.JSON)
}

const readNotesJson = (rootUri, filename, fallback) => {
    const folder = findDirectory(rootUri, NOTES_FOLDER_NAME)
    return folder ? readJson(folder.uri, filename, fallback) : fallback
}

const writeNotesJson = (rootUri, filename, data) => {
    writeJson(getOrCreateNotesFolder(rootUri).uri, filename, data)
}

const deleteNotesFile = (rootUri, filename) => {
    const folder = findDirectory(rootUri, NOTES_FOLDER_NAME)
    if (folder) deleteNoteFile(folder.uri, filename)
}

const getVersionsFilename = (key) => encodeURIComponent(key) + VERSIONS_FILENAME_SUFFIX

const readVersions = (rootUri, key) => readNotesJson(rootUri, getVersionsFilename(key), [])
const writeVersions = (rootUri, key, versions) => writeNotesJson(rootUri, getVersionsFilename(key), versions)
const deleteVersions = (rootUri, key) => deleteNotesFile(rootUri, getVersionsFilename(key))

const clearRepository = (directoryUri, { rootUri, folderPath }) => {
    listMarkdownFiles(directoryUri).forEach((file) => {
        new File(file.uri).delete()
        deleteVersions(rootUri, buildVersionKey(folderPath, file.name))
    })
}

const renameVersions = async (rootUri, oldKey, newKey) => {
    const versions = await readVersions(rootUri, oldKey)
    if (Array.isArray(versions) ? !versions.length : !versions.entries?.length) return

    writeVersions(rootUri, newKey, versions)
    deleteVersions(rootUri, oldKey)
}

const listVersionsUnder = (rootUri, prefix) => {
    const folder = findDirectory(rootUri, NOTES_FOLDER_NAME)
    if (!folder) return []

    const encodedPrefix = encodeURIComponent(prefix + '/')

    return listEntries(folder.uri)
        .filter((entry) => (
            !entry.isDirectory &&
            entry.name.startsWith(encodedPrefix) &&
            entry.name.endsWith(VERSIONS_FILENAME_SUFFIX)
        ))
        .map((entry) => decodeURIComponent(entry.name.slice(0, -VERSIONS_FILENAME_SUFFIX.length)))
}

const renameVersionsUnder = async (rootUri, oldPrefix, newPrefix) => {
    for (const key of listVersionsUnder(rootUri, oldPrefix)) {
        await renameVersions(rootUri, key, newPrefix + key.slice(oldPrefix.length))
    }
}

const deleteVersionsUnder = (rootUri, prefix) => {
    listVersionsUnder(rootUri, prefix).forEach((key) => deleteVersions(rootUri, key))
}

const migrateLegacyVersions = async (folderUri, rootUri, folderPath) => {
    const legacyFiles = (await scanEntries(folderUri)).filter((entry) => (
        !entry.isDirectory && entry.name.endsWith(VERSIONS_FILENAME_SUFFIX)
    ))

    for (const file of legacyFiles) {
        const filename = file.name.slice(0, -VERSIONS_FILENAME_SUFFIX.length)
        const versions = await readJson(folderUri, file.name, null)

        if (versions) writeVersions(rootUri, buildVersionKey(folderPath, filename), versions)
        new File(file.uri).delete()
    }
}

const getRepositoryIndexFile = (repositoryId) => (
    new File(Paths.document, REPOSITORY_INDEX_FOLDER_NAME, `${repositoryId}.json`)
)

const restoreNotes = (notes, tags, links) => {
    notes.forEach((note, index) => {
        if (tags?.[index]) seedNoteTags(note, tags[index])
        if (links?.[index]) seedNoteLinkTexts(note, links[index])
    })

    return notes
}

const readRepositoryIndex = async (repositoryId) => {
    const file = getRepositoryIndexFile(repositoryId)
    if (!file.exists) return []

    try {
        const { version, notes, tags, links } = JSON.parse(await file.text())
        return version === REPOSITORY_INDEX_VERSION ? restoreNotes(notes, tags, links) : []
    } catch (error) {
        logError(LOG_MESSAGES.ERROR_READING_REPOSITORY_INDEX, error)
        return []
    }
}

const writeRepositoryIndex = (repositoryId, notes) => {
    try {
        const folder = new Directory(Paths.document, REPOSITORY_INDEX_FOLDER_NAME)
        if (!folder.exists) folder.create()

        const file = getRepositoryIndexFile(repositoryId)
        if (!file.exists) file.create()
        file.write(JSON.stringify({
            version: REPOSITORY_INDEX_VERSION,
            notes,
            tags: notes.map(getNoteTags),
            links: notes.map(getNoteLinkTexts)
        }))
    } catch (error) {
        logError(LOG_MESSAGES.ERROR_WRITING_REPOSITORY_INDEX, error)
    }
}

const deleteRepositoryIndex = (repositoryId) => {
    const file = getRepositoryIndexFile(repositoryId)
    if (file.exists) file.delete()
}

export const fileStorage = {
    findFile,
    fileExists,
    getExistingFile,
    findDirectory,
    listMarkdownFiles,
    listSubdirectories,
    scanMarkdownFiles,
    scanSubdirectories,
    scanAttachments,
    readTextFiles,
    readRepositoryIndex,
    writeRepositoryIndex,
    deleteRepositoryIndex,
    writeNoteFile,
    renameNoteFile,
    deleteNoteFile,
    clearRepository,
    deleteDirectory,
    directoryExists,
    renameDirectory,
    readVersions,
    writeVersions,
    deleteVersions,
    renameVersions,
    renameVersionsUnder,
    deleteVersionsUnder,
    migrateLegacyVersions,
    readJson,
    writeJson,
    readNotesJson,
    writeNotesJson,
    deleteNotesFile,
    createSubdirectory,
    getOrCreateTemplatesFolder,
    getOrCreateImagesFolder,
    getOrCreateVaultTrashFolder,
    getOrCreateNotesFolder,
    moveNoteFiles,
    copyImageFile
}
