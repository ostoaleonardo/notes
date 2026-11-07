import {
    ASCII_CONTROL_SPACE_FROM,
    ASCII_CONTROL_SPACE_TO,
    ASCII_LIMIT,
    ASCII_SPACE_CODE,
    UNICODE_WHITESPACE_CODES
} from '@/constants/word-count'

const isWhitespace = (code) => (
    code === ASCII_SPACE_CODE ||
    (code >= ASCII_CONTROL_SPACE_FROM && code <= ASCII_CONTROL_SPACE_TO) ||
    (code > ASCII_LIMIT && UNICODE_WHITESPACE_CODES.has(code))
)

export const countWords = (text = '') => {
    let words = 0
    let inWord = false

    for (let index = 0; index < text.length; index++) {
        const word = !isWhitespace(text.charCodeAt(index))

        if (word && !inWord) words++
        inWord = word
    }

    return { words, characters: text.length }
}
