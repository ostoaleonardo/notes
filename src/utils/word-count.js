export const countWords = (text = '') => {
    const trimmed = text.trim()

    return {
        words: trimmed ? trimmed.split(/\s+/).length : 0,
        characters: text.length
    }
}
