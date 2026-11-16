import { WORD_PATTERN } from '@/shared/constants/markdown-patterns'

export const countWords = (text = '') => {
    let words = 0
    WORD_PATTERN.lastIndex = 0

    while (WORD_PATTERN.test(text)) words++

    return { words, characters: text.length }
}
