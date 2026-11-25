import { Directory, File } from 'expo-file-system'

import { repositoryEngine } from '@/shared/utils/repository-engine'
import { invalidateMediaIndex } from '@/shared/utils/media-index'

import {
    NOTE_FILE_EXTENSION,
    TEMPLATES_FOLDER_NAME,
    IMAGES_FOLDER_NAME,
    NOTES_FOLDER_NAME,
    RESERVED_FOLDER_NAMES
} from '@/shared/constants/file-storage'
import { MIME_TYPES } from '@/shared/constants/mime-types'

const listEntries = (directoryUri) => repositoryEngine.listDirectorySync(directoryUri)

const isMarkdownFile = (entry) => (
    !entry.isDirectory &&
    entry.name.toLowerCase().endsWith(NOTE_FILE_EXTENSION)
)

const isNoteFolder = (entry) => (
    entry.isDirectory &&
    !entry.name.startsWith('.') &&
    !RESERVED_FOLDER_NAMES.includes(entry.name)
)

export const findChild = (directoryUri, name) => repositoryEngine.findChild(directoryUri, name)

export const fileExists = (directoryUri, filename) => {
    const entry = findChild(directoryUri, filename)

    return !!entry && !entry.isDirectory
}

export const findFile = (directoryUri, filename) => {
    const entry = findChild(directoryUri, filename)

    return entry && !entry.isDirectory ? new File(entry.uri) : undefined
}

export const getExistingFile = (fileUri) => {
    if (!fileUri) return undefined

    const file = new File(fileUri)
    return file.exists ? file : undefined
}

export const findDirectory = (directoryUri, name) => {
    const entry = findChild(directoryUri, name)

    return entry?.isDirectory ? new Directory(entry.uri) : undefined
}

export const createSubdirectory = (directoryUri, name) => (
    new Directory(directoryUri).createDirectory(name)
)

export const getOrCreateTemplatesFolder = (directoryUri) => (
    findDirectory(directoryUri, TEMPLATES_FOLDER_NAME) || createSubdirectory(directoryUri, TEMPLATES_FOLDER_NAME)
)

export const getOrCreateImagesFolder = (directoryUri) => (
    findDirectory(directoryUri, IMAGES_FOLDER_NAME) || createSubdirectory(directoryUri, IMAGES_FOLDER_NAME)
)

export const getOrCreateNotesFolder = (directoryUri) => (
    findDirectory(directoryUri, NOTES_FOLDER_NAME) || createSubdirectory(directoryUri, NOTES_FOLDER_NAME)
)

export const listMarkdownFiles = (directoryUri) => listEntries(directoryUri).filter(isMarkdownFile)

export const listSubdirectories = (directoryUri) => listEntries(directoryUri).filter(isNoteFolder)

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
        const scan = repositoryEngine.listDirectory(directoryUri)
            .then(toEntries)
            .finally(() => pendingScans.delete(directoryUri))
        pendingScans.set(directoryUri, scan)
    }

    return pendingScans.get(directoryUri)
}

export const scanMarkdownFiles = async (directoryUri) => (await scanEntries(directoryUri)).filter(isMarkdownFile)

export const scanSubdirectories = async (directoryUri) => (await scanEntries(directoryUri)).filter(isNoteFolder)

export const readTextFiles = (fileUris) => repositoryEngine.readTextFiles(fileUris)

export const scanAttachments = async (rootUri) => {
    const { uris, names, folders } = await repositoryEngine.listAttachments(rootUri)

    return names.map((filename, index) => ({ filename, uri: uris[index], folder: folders[index] }))
}

export const deleteDirectory = (directoryUri) => {
    new Directory(directoryUri).delete()
    invalidateMediaIndex()
}

export const directoryExists = (directoryUri) => new Directory(directoryUri).exists

export const copyImageFile = async (sourceUri, directoryUri, filename) => {
    const source = new File(sourceUri)
    const bytes = await source.bytes()
    const file = new Directory(directoryUri).createFile(filename, source.type || MIME_TYPES.JPEG)
    file.write(bytes)
    invalidateMediaIndex()
    return file
}
