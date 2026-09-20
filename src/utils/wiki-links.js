import {
    WIKI_LINK_SCHEME,
    WIKI_LINK_MISSING_PREFIX,
    WIKI_LINK_PATTERN,
    MARKDOWN_WIKI_LINK_PATTERN
} from '@/constants/wiki-links'

const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const parseWikiLinkText = (text) => {
    const trimmed = (text || '').trim()
    const separatorIndex = trimmed.lastIndexOf('/')

    if (separatorIndex === -1) return { path: '', title: trimmed }
    return { path: trimmed.slice(0, separatorIndex), title: trimmed.slice(separatorIndex + 1) }
}

export const resolveWikiLinkTarget = (linkText, notes, notePaths = new Map()) => {
    const { path, title } = parseWikiLinkText(linkText)
    const trimmedTitle = title.toLowerCase()

    const candidates = notes.filter((note) => note.title?.trim().toLowerCase() === trimmedTitle)
    if (candidates.length < 2 || !path) return candidates[0]

    const trimmedPath = path.trim().toLowerCase()
    return candidates.find((note) => (notePaths.get(note.id) || '').toLowerCase() === trimmedPath) || candidates[0]
}

export const resolveWikiLinks = (value, notes, notePaths = new Map()) => value.replace(
    WIKI_LINK_PATTERN,
    (match, linkText, alias) => {
        const { title } = parseWikiLinkText(linkText)
        const label = escapeHtml((alias || title).trim())

        const target = resolveWikiLinkTarget(linkText, notes, notePaths)

        if (!target) {
            const missingHref = `${WIKI_LINK_SCHEME}${WIKI_LINK_MISSING_PREFIX}${encodeURIComponent(title)}`
            return `<a href="${missingHref}" class="wiki-link-broken">${label}</a>`
        }

        return `<a href="${WIKI_LINK_SCHEME}${target.id}" class="wiki-link">${label}</a>`
    }
)

export const findBacklinks = (targetId, notes, notePaths = new Map()) => (
    notes.filter((note) => {
        if (note.id === targetId) return false

        const body = note.note || ''

        const hasWikiLink = [...body.matchAll(WIKI_LINK_PATTERN)].some(
            (match) => resolveWikiLinkTarget(match[1], notes, notePaths)?.id === targetId
        )
        if (hasWikiLink) return true

        return [...body.matchAll(MARKDOWN_WIKI_LINK_PATTERN)].some((match) => match[2] === targetId)
    })
)

export const renameWikiLinksForNote = (content, targetId, newTitle, notes, notePaths = new Map()) => {
    if (!content) return content

    return content.replace(WIKI_LINK_PATTERN, (match, linkText, alias) => {
        if (resolveWikiLinkTarget(linkText, notes, notePaths)?.id !== targetId) return match
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
