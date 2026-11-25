import { findDirectory, findFile, getOrCreateNotesFolder } from './entries'
import { deleteNoteFile, writeNoteFile } from './notes'
import { logError } from '@/shared/utils/log-error'

import { CORRUPT_FILE_SUFFIX, NOTES_FOLDER_NAME } from '@/shared/constants/file-storage'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { MIME_TYPES } from '@/shared/constants/mime-types'

export const readJson = async (directoryUri, filename, fallback) => {
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

export const writeJson = (directoryUri, filename, data) => {
    writeNoteFile(directoryUri, filename, JSON.stringify(data), MIME_TYPES.JSON)
}

export const readNotesJson = (rootUri, filename, fallback) => {
    const folder = findDirectory(rootUri, NOTES_FOLDER_NAME)
    return folder ? readJson(folder.uri, filename, fallback) : fallback
}

export const writeNotesJson = (rootUri, filename, data) => {
    writeJson(getOrCreateNotesFolder(rootUri).uri, filename, data)
}

export const deleteNotesFile = (rootUri, filename) => {
    const folder = findDirectory(rootUri, NOTES_FOLDER_NAME)
    if (folder) deleteNoteFile(folder.uri, filename)
}
