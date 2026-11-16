import { NOTE_FILE_EXTENSION } from '@/shared/constants/file-storage'
import {
    ILLEGAL_FILENAME_CHARS,
    LINK_BREAKING_FILENAME_CHARS,
    NOTE_FILE_EXTENSION_REGEX,
    FILENAME_MAX_LENGTH,
    DEFAULT_FILENAME
} from '@/shared/constants/note-filename'

export const stripNoteExtension = (filename) => filename.replace(NOTE_FILE_EXTENSION_REGEX, '')

export const sanitizeFilename = (title) => {
    const clean = (title || '')
        .replace(ILLEGAL_FILENAME_CHARS, ' ')
        .trim()
        .slice(0, FILENAME_MAX_LENGTH)
    return clean || DEFAULT_FILENAME
}

export const hasLinkBreakingChars = (title) => LINK_BREAKING_FILENAME_CHARS.test(title || '')

export const getUniqueTitle = (existingTitles, base) => {
    const taken = new Set(existingTitles)
    let title = base
    let count = 2

    while (taken.has(title)) {
        title = `${base} (${count})`
        count++
    }

    return title
}

export const isTitleTakenBy = (exists, title, currentFilename) => {
    const candidate = sanitizeFilename(title) + NOTE_FILE_EXTENSION
    return candidate !== currentFilename && exists(candidate)
}

export const isTitleTaken = (existingNames, title, currentFilename) => (
    isTitleTakenBy((name) => existingNames.includes(name), title, currentFilename)
)

export const getUniqueFilenameBy = (exists, title, currentFilename, extension = NOTE_FILE_EXTENSION) => {
    const base = sanitizeFilename(title)
    const isTaken = (name) => name !== currentFilename && exists(name)

    let filename = base + extension
    let count = 2

    while (isTaken(filename)) {
        filename = `${base} (${count})${extension}`
        count++
    }

    return filename
}

export const getUniqueFilename = (existingNames, title, currentFilename, extension = NOTE_FILE_EXTENSION) => {
    const names = new Set(existingNames)

    return getUniqueFilenameBy((name) => names.has(name), title, currentFilename, extension)
}
