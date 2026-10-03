import {
    INVALID_TAG_CHAR_PATTERN,
    LEADING_HASH_PATTERN,
    NON_NUMERIC_PATTERN,
    TRAILING_SLASHES_PATTERN,
    WHITESPACE_RUN_PATTERN
} from '@/constants/markdown-patterns'
import { TAG_PATH_SEPARATOR, TAG_WORD_JOINER } from '@/constants/tags'

export const tagKey = (name) => name.toLowerCase()

export const isSameTag = (a, b) => tagKey(a) === tagKey(b)

export const hasTag = (tags, name) => tags.some((tag) => isSameTag(tag, name))

export const dedupeTags = (tags) => {
    const seen = new Set()

    return tags.filter((tag) => {
        const key = tagKey(tag)
        if (seen.has(key)) return false

        seen.add(key)
        return true
    })
}

export const matchesTag = (tag, query) => {
    const key = tagKey(tag)
    return key === query || key.startsWith(query + TAG_PATH_SEPARATOR)
}

export const sanitizeTagName = (name) => name
    .trim()
    .replace(LEADING_HASH_PATTERN, '')
    .replace(WHITESPACE_RUN_PATTERN, TAG_WORD_JOINER)
    .replace(INVALID_TAG_CHAR_PATTERN, '')
    .replace(TRAILING_SLASHES_PATTERN, '')

export const isValidTagName = (name) => NON_NUMERIC_PATTERN.test(name)
