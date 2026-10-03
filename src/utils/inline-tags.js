import { dedupeTags, isValidTagName } from './tag-names'

import {
    FENCED_CODE_PATTERN,
    FRONTMATTER_REGEX,
    INLINE_CODE_PATTERN,
    INLINE_TAG_PATTERN,
    TRAILING_SLASHES_PATTERN
} from '@/constants/markdown-patterns'

const blank = (text, pattern) => text.replace(pattern, (match) => ' '.repeat(match.length))

export const findInlineTags = (text) => {
    if (!text || !text.includes('#')) return []

    const visible = blank(blank(blank(text, FRONTMATTER_REGEX), FENCED_CODE_PATTERN), INLINE_CODE_PATTERN)
    const found = []

    for (const match of visible.matchAll(INLINE_TAG_PATTERN)) {
        const name = match[2].replace(TRAILING_SLASHES_PATTERN, '')
        if (!isValidTagName(name)) continue

        const from = match.index + match[1].length
        found.push({ name, from, to: from + 1 + name.length })
    }

    return found
}

export const extractInlineTags = (body) => dedupeTags(findInlineTags(body).map(({ name }) => name))
