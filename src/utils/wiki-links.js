import { WIKI_LINK_SCHEME, WIKI_LINK_PATTERN } from '@/constants/wiki-links'

const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const resolveWikiLinks = (value, notes) => value.replace(
    WIKI_LINK_PATTERN,
    (match, title, alias) => {
        const trimmedTitle = title.trim()
        const label = escapeHtml((alias || trimmedTitle).trim())

        const target = notes.find((note) => (
            note.title?.trim().toLowerCase() === trimmedTitle.toLowerCase()
        ))

        if (!target) return `<span class="wiki-link-broken">${label}</span>`

        return `<a href="${WIKI_LINK_SCHEME}${target.id}" class="wiki-link">${label}</a>`
    }
)

export const findBacklinks = (title, notes, excludeId) => {
    const trimmedTitle = title?.trim().toLowerCase()
    if (!trimmedTitle) return []

    return notes.filter((note) => {
        if (note.id === excludeId) return false

        return [...(note.note || '').matchAll(WIKI_LINK_PATTERN)].some(
            (match) => match[1].trim().toLowerCase() === trimmedTitle
        )
    })
}

export const renameWikiLinks = (content, oldTitle, newTitle) => {
    const trimmedOld = oldTitle?.trim().toLowerCase()
    if (!trimmedOld || !content) return content

    return content.replace(WIKI_LINK_PATTERN, (match, title, alias) => {
        if (title.trim().toLowerCase() !== trimmedOld) return match
        return alias !== undefined ? `[[${newTitle}|${alias}]]` : `[[${newTitle}]]`
    })
}

export const buildBacklinksHtml = (backlinks, label) => {
    if (!backlinks.length) return ''

    const items = backlinks.map((note) => (
        `<li><a href="${WIKI_LINK_SCHEME}${note.id}" class="wiki-link">${escapeHtml(note.title || '')}</a></li>`
    )).join('')

    return `<div class="backlinks"><div class="backlinks-title">${escapeHtml(label)}</div><ul>${items}</ul></div>`
}
