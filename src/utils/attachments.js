import {
    ATTACHMENT_LOCATIONS,
    DEFAULT_ATTACHMENT_FOLDER,
    DEFAULT_ATTACHMENT_LOCATION,
    INVALID_FOLDER_NAME_PATTERN
} from '@/constants/attachments'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { EMBED_IMAGE_PATTERN } from '@/constants/embeds'

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
