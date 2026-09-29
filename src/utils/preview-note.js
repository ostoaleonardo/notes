import { PREVIEW_MAX_LINES, PREVIEW_MAX_CHARS } from '@/constants/note-preview'

const imageRegex = /!\[([^\]]*)\]\(([^\)]*)\)/g
const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g

const MARKER = '⁣'

export const getPreviewNote = (note, maxLines = PREVIEW_MAX_LINES, maxChars = PREVIEW_MAX_CHARS) => {
    if (!note) return ''

    let preview = note.split('\n').slice(0, maxLines).join('\n')

    const markdownByKey = new Map()
    let count = 0

    let temp = preview.replace(imageRegex, (_, alt, url) => {
        const key = `${MARKER}${count++}${MARKER}`
        markdownByKey.set(key, (text) => `![${text}](${url})`)
        return `${key}${alt}${key}`
    })

    temp = temp.replace(linkRegex, (_, text, url) => {
        const key = `${MARKER}${count++}${MARKER}`
        markdownByKey.set(key, (label) => `[${label}](${url})`)
        return `${key}${text}${key}`
    })

    const limited = temp.length > maxChars ? temp.slice(0, maxChars) + '...' : temp

    let rendered = limited
    markdownByKey.forEach((toMarkdown, key) => {
        const parts = rendered.split(key)
        if (parts.length !== 3) return

        const [before, text, after] = parts
        rendered = before + toMarkdown(text) + after
    })

    return rendered
}
