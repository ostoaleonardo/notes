const ILLEGAL_CHARS = '/\\:*?"<>|'
const LAST_CONTROL_CODE = 31
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
const MAX_BYTES = 255
const UNIQUE_RESERVE = 8
const DEFAULT_NAME = 'Untitled'

const cutToBytes = (text, limit) => {
    let result = ''

    for (const character of text) {
        if (Buffer.byteLength(result + character) > limit) break
        result += character
    }

    return result
}

const isIllegal = (character) => (
    ILLEGAL_CHARS.includes(character) || character.codePointAt(0) <= LAST_CONTROL_CODE
)

const key = (name) => name.normalize('NFC').toLowerCase()

export const sanitizeFilename = (title, extension) => {
    const replaced = [...title.normalize('NFC')]
        .map((character) => (isIllegal(character) ? ' ' : character))
        .join('')
    const limit = MAX_BYTES - Buffer.byteLength(extension) - UNIQUE_RESERVE
    const cut = cutToBytes(replaced.trim(), limit).replace(/[. \s]+$/, '')

    if (!cut) return DEFAULT_NAME

    const deviceEnd = cut.includes('.') ? cut.indexOf('.') : cut.length

    return RESERVED.test(cut.slice(0, deviceEnd))
        ? `${cut.slice(0, deviceEnd)}_${cut.slice(deviceEnd)}`
        : cut
}

export const uniqueFilename = (existing, stem, extension, current) => {
    const taken = new Set(existing.map(key))
    const own = current == null ? null : key(current)
    const isTaken = (name) => key(name) !== own && taken.has(key(name))

    let name = `${stem}${extension}`
    let count = 2

    while (isTaken(name)) {
        name = `${stem} (${count})${extension}`
        count++
    }

    return name
}
