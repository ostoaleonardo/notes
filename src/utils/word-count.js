import { WHITESPACE_RUN_PATTERN } from '@/constants/markdown-patterns'

export const countWords = (text = '') => {
    const trimmed = text.trim()

    return {
        words: trimmed ? trimmed.split(WHITESPACE_RUN_PATTERN).length : 0,
        characters: text.length
    }
}
