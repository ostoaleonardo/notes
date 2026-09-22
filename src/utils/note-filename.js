import { NOTE_FILE_EXTENSION } from '@/constants/file-storage'

const ILLEGAL_CHARS = /[/\\:*?"<>|\x00-\x1F]/g
const NOTE_FILE_EXTENSION_REGEX = /\.md$/i

export const stripNoteExtension = (filename) => filename.replace(NOTE_FILE_EXTENSION_REGEX, '')

export const sanitizeFilename = (title) => {
    const clean = (title || '').replace(ILLEGAL_CHARS, ' ').trim().slice(0, 200)
    return clean || 'Untitled'
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

export const getUniqueFilename = (existingNames, title, currentFilename) => {
    const base = sanitizeFilename(title)
    const taken = new Set(existingNames.filter((name) => name !== currentFilename))

    let filename = base + NOTE_FILE_EXTENSION
    let count = 2

    while (taken.has(filename)) {
        filename = `${base} (${count})${NOTE_FILE_EXTENSION}`
        count++
    }

    return filename
}
