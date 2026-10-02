import { NOTE_FILE_EXTENSION } from '@/constants/file-storage'
import {
    ILLEGAL_FILENAME_CHARS,
    NOTE_FILE_EXTENSION_REGEX,
    FILENAME_MAX_LENGTH,
    DEFAULT_FILENAME
} from '@/constants/note-filename'

export const stripNoteExtension = (filename) => filename.replace(NOTE_FILE_EXTENSION_REGEX, '')

export const sanitizeFilename = (title) => {
    const clean = (title || '')
        .replace(ILLEGAL_FILENAME_CHARS, ' ')
        .trim()
        .slice(0, FILENAME_MAX_LENGTH)
    return clean || DEFAULT_FILENAME
}

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

export const isTitleTaken = (existingNames, title, currentFilename) => {
    const candidate = sanitizeFilename(title) + NOTE_FILE_EXTENSION
    return existingNames.some((name) => name === candidate && name !== currentFilename)
}

export const getUniqueFilename = (existingNames, title, currentFilename, extension = NOTE_FILE_EXTENSION) => {
    const base = sanitizeFilename(title)
    const taken = new Set(existingNames.filter((name) => name !== currentFilename))

    let filename = base + extension
    let count = 2

    while (taken.has(filename)) {
        filename = `${base} (${count})${extension}`
        count++
    }

    return filename
}
