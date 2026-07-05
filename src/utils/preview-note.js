const imageRegex = /!\[([^\]]*)\]\(([^\)]*)\)/g
const linkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g

export const getPreviewNote = (note) => {
    if (!note) return ''

    let preview = note.split('\n').slice(0, 5).join('\n')

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

    // Limit to 150 characters only the visible text
    let limited = temp.length > 150 ? temp.slice(0, 150) + '...' : temp

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
