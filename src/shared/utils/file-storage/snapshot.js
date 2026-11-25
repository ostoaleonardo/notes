import { Directory, File, Paths } from 'expo-file-system'

import { repositoryEngine } from '@/shared/utils/repository-engine'
import { getNoteLinkTexts, seedNoteLinkTexts } from '@/shared/utils/note-links'
import { getNoteTags, seedNoteTags } from '@/shared/utils/note-tags'
import { readFileText } from '@/shared/utils/read-file-text'
import { logError } from '@/shared/utils/log-error'
import { bootMark } from '@/shared/utils/boot-mark'

import { REPOSITORY_INDEX_FOLDER_NAME, REPOSITORY_INDEX_VERSION } from '@/shared/constants/file-storage'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { BOOT_MARKS } from '@/shared/constants/boot-marks'

const getRepositoryIndexFile = (folderId) => (
    new File(Paths.document, REPOSITORY_INDEX_FOLDER_NAME, `${folderId}.json`)
)

const restoreNotes = (notes, tags, links) => {
    notes.forEach((note, index) => {
        if (tags?.[index]) seedNoteTags(note, tags[index])
        if (links?.[index]) seedNoteLinkTexts(note, links[index])
    })

    return notes
}

export const readRepositoryIndex = async (folderId) => {
    const file = getRepositoryIndexFile(folderId)
    if (!file.exists) return []

    try {
        const readStart = Date.now()
        const text = await readFileText(file)
        const parseStart = Date.now()
        const { version, notes, tags, links } = JSON.parse(text)
        const restoreStart = Date.now()
        const restored = version === REPOSITORY_INDEX_VERSION ? restoreNotes(notes, tags, links) : []

        bootMark(BOOT_MARKS.SNAPSHOT, {
            bytes: text.length,
            notes: restored.length,
            readMs: parseStart - readStart,
            parseMs: restoreStart - parseStart,
            restoreMs: Date.now() - restoreStart
        })

        return restored
    } catch (error) {
        logError(LOG_MESSAGES.ERROR_READING_REPOSITORY_INDEX, error)
        return []
    }
}

export const writeRepositoryIndex = (folderId, notes) => {
    try {
        const folder = new Directory(Paths.document, REPOSITORY_INDEX_FOLDER_NAME)
        if (!folder.exists) folder.create()

        const file = getRepositoryIndexFile(folderId)
        if (!file.exists) file.create()
        const stringifyStart = Date.now()
        const payload = JSON.stringify({
            version: REPOSITORY_INDEX_VERSION,
            notes,
            tags: notes.map(getNoteTags),
            links: notes.map(getNoteLinkTexts)
        })
        const writeStart = Date.now()

        file.write(payload)

        bootMark(BOOT_MARKS.SNAPSHOT_WRITE, {
            bytes: payload.length,
            stringifyMs: writeStart - stringifyStart,
            writeMs: Date.now() - writeStart
        })
    } catch (error) {
        logError(LOG_MESSAGES.ERROR_WRITING_REPOSITORY_INDEX, error)
    }
}

export const deleteFolderIndex = (folderId) => {
    const file = getRepositoryIndexFile(folderId)
    if (file.exists) file.delete()

    repositoryEngine.deleteFolderIndex(folderId).catch((error) => {
        logError(LOG_MESSAGES.ERROR_DELETING_NATIVE_INDEX, error)
    })
}
