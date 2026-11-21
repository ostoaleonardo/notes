import RepositoryFs from 'repository-fs'

import { NOTE_FILE_EXTENSION } from '@/shared/constants/file-storage'
import {
    LINK_BREAKING_FILENAME_CHARS,
    NOTE_FILE_EXTENSION_REGEX
} from '@/shared/constants/note-filename'

export const stripNoteExtension = (filename) => filename.replace(NOTE_FILE_EXTENSION_REGEX, '')

export const sanitizeFilename = (title, extension = NOTE_FILE_EXTENSION) => (
    RepositoryFs.sanitizeFilename(title || '', extension)
)

export const hasLinkBreakingChars = (title) => LINK_BREAKING_FILENAME_CHARS.test(title || '')

export const getUniqueTitle = (existingTitles, base) => (
    RepositoryFs.uniqueFilename(existingTitles, base, '', null)
)

export const getUniqueFilename = (
    existingNames,
    title,
    currentFilename,
    extension = NOTE_FILE_EXTENSION
) => RepositoryFs.uniqueFilename(
    existingNames,
    sanitizeFilename(title, extension),
    extension,
    currentFilename
)

export const isTitleTaken = (existingNames, title, currentFilename) => {
    const candidate = sanitizeFilename(title) + NOTE_FILE_EXTENSION

    return getUniqueFilename(existingNames, title, currentFilename) !== candidate
}
