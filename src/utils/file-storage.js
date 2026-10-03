import { Directory, File, FileMode } from 'expo-file-system'

import { getUniqueFilename, stripNoteExtension } from '@/utils/note-filename'
import { buildVersionKey } from '@/utils/note-version-location'

import {
    NOTE_FILE_EXTENSION,
    VERSIONS_FILENAME_SUFFIX,
    TEMPLATES_FOLDER_NAME,
    IMAGES_FOLDER_NAME,
    VAULT_TRASH_FOLDER_NAME,
    NOTES_FOLDER_NAME,
    RESERVED_FOLDER_NAMES,
    CORRUPT_FILE_SUFFIX
} from '@/constants/file-storage'
import { MIME_TYPES } from '@/constants/mime-types'
import { logError } from './log-error'

const listEntries = (directoryUri) => new Directory(directoryUri).list()

const findFile = (directoryUri, filename) => (
    listEntries(directoryUri).find((entry) => (
        entry instanceof File && entry.name === filename
    ))
)

const findDirectory = (directoryUri, name) => (
    listEntries(directoryUri).find((entry) => (
        entry instanceof Directory && entry.name === name
    ))
)

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

const listMarkdownFiles = (directoryUri) => (
    listEntries(directoryUri).filter((entry) => (
        entry instanceof File &&
        entry.name.toLowerCase().endsWith(NOTE_FILE_EXTENSION)
    ))
)

const listSubdirectories = (directoryUri) => (
    listEntries(directoryUri).filter((entry) => (
        entry instanceof Directory &&
        !entry.name.startsWith('.') &&
        !RESERVED_FOLDER_NAMES.includes(entry.name)
    ))
)

const deleteDirectory = (directoryUri) => {
    new Directory(directoryUri).delete()
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

    return newDirectory.uri
}

const copyImageFile = async (sourceUri, directoryUri, filename) => {
    const source = new File(sourceUri)
    const bytes = await source.bytes()
    const file = new Directory(directoryUri).createFile(filename, source.type || MIME_TYPES.JPEG)
    file.write(bytes)
    return file
}

const writeNoteFile = (
    directoryUri,
    filename,
    content,
    mimeType = MIME_TYPES.MARKDOWN,
    existing = findFile(directoryUri, filename)
) => {
    if (!existing) {
        const file = new Directory(directoryUri).createFile(filename, mimeType)
        file.write(content)
        return file
    }

    const handle = existing.open(FileMode.Truncate)
    try {
        handle.writeBytes(new TextEncoder().encode(content))
    } finally {
        handle.close()
    }
    return existing
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
    const names = listMarkdownFiles(destinationUri).map((file) => file.name)
    const target = getUniqueFilename(names, stripNoteExtension(filename), null)

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
        logError(`error parsing json file ${filename}`, error)
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
        file.delete()
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
            entry instanceof File &&
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
    const legacyFiles = listEntries(folderUri).filter((entry) => (
        entry instanceof File && entry.name.endsWith(VERSIONS_FILENAME_SUFFIX)
    ))

    for (const file of legacyFiles) {
        const filename = file.name.slice(0, -VERSIONS_FILENAME_SUFFIX.length)
        const versions = await readJson(folderUri, file.name, null)

        if (versions) writeVersions(rootUri, buildVersionKey(folderPath, filename), versions)
        file.delete()
    }
}

export const fileStorage = {
    findFile,
    findDirectory,
    listMarkdownFiles,
    listSubdirectories,
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
