import { PREVIEW_MAX_LINES, PREVIEW_MAX_CHARS, PREVIEW_ELLIPSIS } from '@/constants/note-preview'
import {
    PREVIEW_IMAGE_PATTERN,
    PREVIEW_LINK_PATTERN,
    PREVIEW_MARKER
} from '@/constants/markdown-patterns'

export const getPreviewNote = (note, maxLines = PREVIEW_MAX_LINES, maxChars = PREVIEW_MAX_CHARS) => {
    if (!note) return ''

    let preview = note.split('\n').slice(0, maxLines).join('\n')

    const markdownByKey = new Map()
    let count = 0

    let temp = preview.replace(PREVIEW_IMAGE_PATTERN, (_, alt, url) => {
        const key = `${PREVIEW_MARKER}${count++}${PREVIEW_MARKER}`
        markdownByKey.set(key, (text) => `![${text}](${url})`)
        return `${key}${alt}${key}`
    })

    temp = temp.replace(PREVIEW_LINK_PATTERN, (_, text, url) => {
        const key = `${PREVIEW_MARKER}${count++}${PREVIEW_MARKER}`
        markdownByKey.set(key, (label) => `[${label}](${url})`)
        return `${key}${text}${key}`
    })

    const limited = temp.length > maxChars ? temp.slice(0, maxChars) + PREVIEW_ELLIPSIS : temp

    let rendered = limited
    markdownByKey.forEach((toMarkdown, key) => {
        const parts = rendered.split(key)
        if (parts.length !== 3) return

        const [before, text, after] = parts
        rendered = before + toMarkdown(text) + after
    })

    return rendered
}
