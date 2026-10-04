import {
    WIKI_LINK_SCHEME,
    WIKI_LINK_MISSING_PREFIX,
    WIKI_LINK_PATTERN,
    WIKI_LINK_ANCHOR_SEPARATOR,
    WIKI_LINK_ANCHOR_LABEL_SEPARATOR,
    NOTE_ALIASES_PROPERTY,
    MARKDOWN_WIKI_LINK_PATTERN
} from '@/constants/wiki-links'
import {
    BACKLINKS_CLASS,
    BACKLINKS_TITLE_CLASS,
    BACKLINK_TITLE_CLASS,
    BACKLINK_PATH_CLASS
} from '@/constants/backlinks'
import { mapOutsideCode } from '@/utils/outside-code'
import { buildFileLinkUrl, isFileLinkTarget } from '@/utils/file-links'

import { FILE_LINK_CLASS } from '@/constants/file-links'

export const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const parseWikiLinkText = (text) => {
    const trimmed = (text || '').trim()
    const separatorIndex = trimmed.lastIndexOf('/')

    if (separatorIndex === -1) return { path: '', title: trimmed }
    return { path: trimmed.slice(0, separatorIndex), title: trimmed.slice(separatorIndex + 1) }
}

const normalizeName = (text) => text.normalize('NFC').trim().toLowerCase()

export const getAliases = (note) => {
    const aliases = note.properties?.[NOTE_ALIASES_PROPERTY]
    return (Array.isArray(aliases) ? aliases : [aliases]).filter((alias) => typeof alias === 'string')
}

const splitAnchor = (text) => {
    const index = text.indexOf(WIKI_LINK_ANCHOR_SEPARATOR)
    if (index === -1) return null
    return { target: text.slice(0, index), anchor: text.slice(index + 1) }
}

const indexCache = new WeakMap()

const pushTo = (map, key, note) => {
    if (map.has(key)) map.get(key).push(note)
    else map.set(key, [note])
}

const getNoteIndex = (notes) => {
    if (indexCache.has(notes)) return indexCache.get(notes)

    const byTitle = new Map()
    const byAlias = new Map()

    for (const note of notes) {
        pushTo(byTitle, normalizeName(note.title || ''), note)
        for (const alias of new Set(getAliases(note).map(normalizeName))) pushTo(byAlias, alias, note)
    }

    const index = { byTitle, byAlias }
    indexCache.set(notes, index)
    return index
}

const findNote = (linkText, notes, notePaths) => {
    const { path, title } = parseWikiLinkText(linkText)
    const name = normalizeName(title)
    const { byTitle, byAlias } = getNoteIndex(notes)

    const candidates = byTitle.get(name) || byAlias.get(name) || []
    if (candidates.length < 2 || !path) return candidates[0]

    const normalizedPath = normalizeName(path)
    return candidates.find((note) => normalizeName(notePaths.get(note.path) || '') === normalizedPath) || candidates[0]
}

export const resolveWikiLink = (linkText, notes, notePaths) => {
    const whole = findNote(linkText, notes, notePaths)
    if (whole) return { note: whole, target: linkText, anchor: '' }

    const split = splitAnchor(linkText)
    if (!split) return { note: undefined, target: linkText, anchor: '' }

    const note = split.target.trim() ? findNote(split.target, notes, notePaths) : undefined
    return { note, ...split }
}

export const resolveWikiLinkTarget = (linkText, notes, notePaths = new Map()) => (
    resolveWikiLink(linkText, notes, notePaths).note
)

export const unwrapWikiLinks = (value) => mapOutsideCode(
    value,
    (segment) => segment.replace(
        WIKI_LINK_PATTERN,
        (match, linkText, alias) => {
            const { target, anchor } = resolveWikiLink(linkText, [], new Map())
            const { title } = parseWikiLinkText(target)
            const defaultLabel = anchor ? `${title}${WIKI_LINK_ANCHOR_LABEL_SEPARATOR}${anchor}` : title

            return escapeHtml((alias || defaultLabel || anchor).trim())
        }
    )
)

export const resolveWikiLinks = (value, notes, notePaths = new Map()) => mapOutsideCode(
    value,
    (segment) => segment.replace(
        WIKI_LINK_PATTERN,
        (match, linkText, alias) => {
            const { note, target, anchor } = resolveWikiLink(linkText, notes, notePaths)
            const { path, title } = parseWikiLinkText(target)

            if (!title.trim()) return escapeHtml((alias || anchor).trim())

            const defaultLabel = anchor ? `${title}${WIKI_LINK_ANCHOR_LABEL_SEPARATOR}${anchor}` : title
            const label = escapeHtml((alias || defaultLabel).trim())

            if (!note && isFileLinkTarget(target)) {
                return `<a href="${buildFileLinkUrl(target)}" class="${FILE_LINK_CLASS}">${escapeHtml((alias || title).trim())}</a>`
            }

            if (!note) {
                const encodedPath = encodeURIComponent(path)
                const encodedTitle = encodeURIComponent(title)
                const missingHref = `${WIKI_LINK_SCHEME}${WIKI_LINK_MISSING_PREFIX}${encodedPath}/${encodedTitle}`
                return `<a href="${missingHref}" class="wiki-link-broken">${label}</a>`
            }

            const anchorSuffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${encodeURIComponent(anchor)}` : ''

            return `<a href="${WIKI_LINK_SCHEME}${encodeURIComponent(note.path)}${anchorSuffix}" class="wiki-link">${label}</a>`
        }
    )
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
    const normalizedNewTitle = normalizeName(newTitle)
    const isAmbiguous = folderPath && notes.some((note) => (
        note.path !== targetPath && normalizeName(note.title || '') === normalizedNewTitle
    ))
    const qualifiedTitle = isAmbiguous ? `${folderPath}/${newTitle}` : newTitle

    return content.replace(WIKI_LINK_PATTERN, (match, linkText, alias) => {
        const { note, target, anchor } = resolveWikiLink(linkText, notes, notePaths)
        if (note?.path !== targetPath) return match
        if (normalizeName(parseWikiLinkText(target).title) !== normalizeName(note.title || '')) return match

        const suffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${anchor}` : ''
        if (alias !== undefined) return `[[${qualifiedTitle}${suffix}|${alias}]]`
        if (!isAmbiguous) return `[[${newTitle}${suffix}]]`

        const label = anchor ? `${newTitle}${WIKI_LINK_ANCHOR_LABEL_SEPARATOR}${anchor}` : newTitle
        return `[[${qualifiedTitle}${suffix}|${label}]]`
    })
}

export const buildBacklinksHtml = (backlinks, label, notePaths = new Map()) => {
    if (!backlinks.length) return ''

    const items = backlinks.map((note) => {
        const path = notePaths.get(note.path) || ''
        const pathHtml = path ? `<span class="${BACKLINK_PATH_CLASS}">${escapeHtml(path)}</span>` : ''

        return (
            `<li><a href="${WIKI_LINK_SCHEME}${encodeURIComponent(note.path)}" class="wiki-link">`
            + `<span class="${BACKLINK_TITLE_CLASS}">${escapeHtml(note.title || '')}</span>${pathHtml}`
            + `</a></li>`
        )
    }).join('')

    return `<div class="${BACKLINKS_CLASS}"><div class="${BACKLINKS_TITLE_CLASS}">${escapeHtml(label)}</div><ul>${items}</ul></div>`
}
