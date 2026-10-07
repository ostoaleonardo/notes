import {
    ATTACHMENT_LOCATIONS,
    DEFAULT_ATTACHMENT_FOLDER,
    DEFAULT_ATTACHMENT_LOCATION,
    INVALID_FOLDER_NAME_PATTERN
} from '@/constants/attachments'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { EMBED_IMAGE_PATTERN } from '@/constants/embeds'
import { FILE_KIND_BY_EXTENSION, FILE_MIME_TYPES } from '@/constants/file-types'

export const sanitizeFolderName = (name) => {
    const clean = (name || '').replace(INVALID_FOLDER_NAME_PATTERN, '').trim()
    return clean && clean !== '.' && clean !== '..' ? clean : DEFAULT_ATTACHMENT_FOLDER
}

export const readAttachmentSettings = async (getItem) => {
    const [location, folder] = await Promise.all([
        getItem(STORAGE_KEYS.ATTACHMENT_LOCATION),
        getItem(STORAGE_KEYS.ATTACHMENT_FOLDER)
    ])

    return {
        location: Object.values(ATTACHMENT_LOCATIONS).includes(location)
            ? location
            : DEFAULT_ATTACHMENT_LOCATION,
        folderName: sanitizeFolderName(folder)
    }
}

export const resolveAttachmentTarget = ({ location, folderName }, { rootUri, noteFolderUri }) => {
    switch (location) {
        case ATTACHMENT_LOCATIONS.VAULT:
            return { parentUri: rootUri, folderName: null }
        case ATTACHMENT_LOCATIONS.SAME_FOLDER:
            return { parentUri: noteFolderUri, folderName: null }
        case ATTACHMENT_LOCATIONS.SUBFOLDER:
            return { parentUri: noteFolderUri, folderName }
        default:
            return { parentUri: rootUri, folderName }
    }
}

export const collectImageUris = (directoryUri, listEntries, found = new Map()) => {
    for (const entry of listEntries(directoryUri)) {
        if (entry.name.startsWith('.')) continue

        if (entry.isDirectory) {
            collectImageUris(entry.uri, listEntries, found)
        } else if (EMBED_IMAGE_PATTERN.test(entry.name) && !found.has(entry.name)) {
            found.set(entry.name, entry.uri)
        }
    }

    return found
}

const getFileExtension = (filename) => (
    filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
)

export const getFileKind = (filename) => (
    filename.includes('.') ? FILE_KIND_BY_EXTENSION[getFileExtension(filename)] ?? null : null
)

export const collectFiles = (directoryUri, listEntries, folder = '', found = []) => {
    for (const entry of listEntries(directoryUri)) {
        if (entry.name.startsWith('.')) continue

        if (entry.isDirectory) {
            collectFiles(entry.uri, listEntries, folder ? folder + '/' + entry.name : entry.name, found)
        } else if (getFileKind(entry.name)) {
            found.push({ filename: entry.name, uri: entry.uri, folder })
        }
    }

    return found
}

export const buildFileRows = (files) => (
    files
        .map(({ filename, uri, folder }) => ({
            id: 'file:' + uri,
            uri,
            folder,
            filename,
            name: filename.slice(0, filename.lastIndexOf('.')),
            extension: getFileExtension(filename).toUpperCase(),
            kind: getFileKind(filename),
            mimeType: FILE_MIME_TYPES[getFileExtension(filename)]
        }))
        .sort((a, b) => a.name.localeCompare(b.name) || a.folder.localeCompare(b.folder))
)

export const findFileByTarget = (rows, target) => {
    const wanted = '/' + target.trim().toLowerCase()

    return rows.find(({ folder, filename }) => (
        ('/' + (folder ? folder + '/' : '') + filename).toLowerCase().endsWith(wanted)
    ))
}
