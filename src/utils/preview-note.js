import { NOTE_PREVIEW_MAX_LINES, NOTE_PREVIEW_MAX_CHARS } from '@/constants'

const imageRegex = /!\[([^\]]*)\]\(([^\)]*)\)/g
const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g

export const getPreviewNote = (note, maxLines = NOTE_PREVIEW_MAX_LINES, maxChars = NOTE_PREVIEW_MAX_CHARS) => {
    if (!note) return ''

    let preview = note.split('\n').slice(0, maxLines).join('\n')

    let images = []
    let links = []
    let temp = preview

    // Extract images
    temp = temp.replace(imageRegex, (match, alt, url) => {
        images.push({ alt, url, match })
        return alt
    })

    // Extract links
    temp = temp.replace(linkRegex, (match, text, url) => {
        links.push({ text, url, match })
        return text
    })

    // Limit to maxChars characters only the visible text
    let limited = temp.length > maxChars ? temp.slice(0, maxChars) + '...' : temp

    // Reinsert images and links into the limited text
    let rendered = limited
    images.forEach(({ alt, url, _ }) => {
        rendered = rendered.replace(alt, `![${alt}](${url})`)
    })
    links.forEach(({ text, url, _ }) => {
        rendered = rendered.replace(text, `[${text}](${url})`)
    })

    return rendered
}
