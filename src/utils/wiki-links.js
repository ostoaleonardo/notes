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
    return candidates.find((note) => (notePaths.get(note.path) || '').toLowerCase() === trimmedPath) || candidates[0]
}

export const resolveWikiLinks = (value, notes, notePaths = new Map()) => value.replace(
    WIKI_LINK_PATTERN,
    (match, linkText, alias) => {
        const { path, title } = parseWikiLinkText(linkText)
        const label = escapeHtml((alias || title).trim())

        const target = resolveWikiLinkTarget(linkText, notes, notePaths)

        if (!target) {
            const encodedPath = encodeURIComponent(path)
            const encodedTitle = encodeURIComponent(title)
            const missingHref = `${WIKI_LINK_SCHEME}${WIKI_LINK_MISSING_PREFIX}${encodedPath}/${encodedTitle}`
            return `<a href="${missingHref}" class="wiki-link-broken">${label}</a>`
        }

        return `<a href="${WIKI_LINK_SCHEME}${encodeURIComponent(target.path)}" class="wiki-link">${label}</a>`
    }
)

export const parseMissingWikiLinkTarget = (encoded) => {
    const separatorIndex = encoded.indexOf('/')

    return {
        path: decodeURIComponent(encoded.slice(0, separatorIndex)),
        title: decodeURIComponent(encoded.slice(separatorIndex + 1))
    }
}

export const findBacklinks = (targetPath, notes, notePaths = new Map()) => (
    notes.filter((note) => {
        if (note.path === targetPath) return false

        const body = note.note || ''

        const hasWikiLink = [...body.matchAll(WIKI_LINK_PATTERN)].some(
            (match) => resolveWikiLinkTarget(match[1], notes, notePaths)?.path === targetPath
        )
        if (hasWikiLink) return true

        return [...body.matchAll(MARKDOWN_WIKI_LINK_PATTERN)].some((match) => match[2] === targetPath)
    })
)

export const renameWikiLinksForNote = (content, targetPath, newTitle, notes, notePaths = new Map()) => {
    if (!content) return content

    const folderPath = notePaths.get(targetPath) || ''
    const normalizedNewTitle = newTitle.trim().toLowerCase()
    const isAmbiguous = folderPath && notes.some((note) => (
        note.path !== targetPath && note.title?.trim().toLowerCase() === normalizedNewTitle
    ))
    const qualifiedTitle = isAmbiguous ? `${folderPath}/${newTitle}` : newTitle

    return content.replace(WIKI_LINK_PATTERN, (match, linkText, alias) => {
        if (resolveWikiLinkTarget(linkText, notes, notePaths)?.path !== targetPath) return match
        if (alias !== undefined) return `[[${qualifiedTitle}|${alias}]]`
        return isAmbiguous ? `[[${qualifiedTitle}|${newTitle}]]` : `[[${newTitle}]]`
    })
}

export const buildBacklinksHtml = (backlinks, label, notePaths = new Map()) => {
    if (!backlinks.length) return ''

    const items = backlinks.map((note) => {
        const path = notePaths.get(note.path) || ''
        const pathHtml = path ? `<span class="backlink-path">${escapeHtml(path)}</span>` : ''

        return (
            `<li><a href="${WIKI_LINK_SCHEME}${encodeURIComponent(note.path)}" class="wiki-link">`
            + `<span class="backlink-title">${escapeHtml(note.title || '')}</span>${pathHtml}`
            + `</a></li>`
        )
    }).join('')

    return `<div class="backlinks"><div class="backlinks-title">${escapeHtml(label)}</div><ul>${items}</ul></div>`
}
