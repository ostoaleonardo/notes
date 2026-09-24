import { PREVIEW_MAX_LINES, PREVIEW_MAX_CHARS } from '@/constants/note-preview'

const imageRegex = /!\[([^\]]*)\]\(([^\)]*)\)/g
const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g

// Invisible separator: marks each match's visible text without affecting how the preview reads.
const MARKER = '⁣'

export const getPreviewNote = (note, maxLines = PREVIEW_MAX_LINES, maxChars = PREVIEW_MAX_CHARS) => {
    if (!note) return ''

    let preview = note.split('\n').slice(0, maxLines).join('\n')

    const markdownByKey = new Map()
    let count = 0

    // Wrap each match's visible text in a unique key pair standing in for its markdown syntax,
    // so reinsertion below can't confuse two images/links that share the same (or empty) text.
    let temp = preview.replace(imageRegex, (match, alt, url) => {
        const key = `${MARKER}${count++}${MARKER}`
        markdownByKey.set(key, (text) => `![${text}](${url})`)
        return `${key}${alt}${key}`
    })

    temp = temp.replace(linkRegex, (match, text, url) => {
        const key = `${MARKER}${count++}${MARKER}`
        markdownByKey.set(key, (label) => `[${label}](${url})`)
        return `${key}${text}${key}`
    })

    // Limit to maxChars characters, counting only the visible text
    const limited = temp.length > maxChars ? temp.slice(0, maxChars) + '...' : temp

    // Reinsert markdown syntax for whichever images/links survived the truncation intact
    let rendered = limited
    markdownByKey.forEach((toMarkdown, key) => {
        const parts = rendered.split(key)
        if (parts.length !== 3) return

        const [before, text, after] = parts
        rendered = before + toMarkdown(text) + after
    })

    return rendered
}
