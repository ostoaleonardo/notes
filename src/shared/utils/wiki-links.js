import {
    WIKI_LINK_SCHEME,
    WIKI_LINK_MISSING_PREFIX,
    WIKI_LINK_PATTERN,
    WIKI_LINK_ANCHOR_SEPARATOR,
    WIKI_LINK_ANCHOR_LABEL_SEPARATOR,
    NOTE_ALIASES_PROPERTY,
    MARKDOWN_WIKI_LINK_PATTERN,
    MARKDOWN_WIKI_LINK_OPENING
} from '@/shared/constants/wiki-links'
import { WIKI_LINK_OPEN } from '@/shared/constants/markdown-syntax'
import {
    BACKLINKS_CLASS,
    BACKLINKS_TITLE_CLASS,
    BACKLINK_TITLE_CLASS,
    BACKLINK_PATH_CLASS
} from '@/shared/constants/backlinks'
import { mapOutsideCode } from '@/shared/utils/outside-code'
import { EMPTY_NOTE_PATHS } from '@/shared/constants/note-paths'
import { buildFileLinkUrl, isFileLinkTarget } from '@/shared/utils/file-links'

import { FILE_LINK_CLASS } from '@/shared/constants/file-links'
import { ANCHOR_TEMPLATE, WIKI_LINK_BROKEN_CLASS, WIKI_LINK_CLASS } from '@/shared/constants/wiki-link-html'
import { BACKLINK_ITEM_TEMPLATE, BACKLINK_LINK_TEMPLATE, BACKLINK_PATH_TEMPLATE, BACKLINKS_TEMPLATE } from '@/shared/constants/backlinks-html'
import { fillTemplate } from '@/shared/utils/fill-template'
import { HTML_ESCAPE_PATTERN, HTML_ESCAPES } from '@/shared/constants/html-sanitize'

export const escapeHtml = (text) => text.replace(HTML_ESCAPE_PATTERN, (char) => HTML_ESCAPES[char])

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

export const resolveWikiLink = (linkText, notes, notePaths, selfPath) => {
    const whole = findNote(linkText, notes, notePaths)
    if (whole) return { note: whole, target: linkText, anchor: '' }

    const split = splitAnchor(linkText)
    if (!split) return { note: undefined, target: linkText, anchor: '' }

    const note = split.target.trim()
        ? findNote(split.target, notes, notePaths)
        : notes.find(({ path }) => path === selfPath)

    return { note, ...split }
}

export const isSameNoteTarget = (linkText) => linkText.trim().startsWith(WIKI_LINK_ANCHOR_SEPARATOR)

export const resolveWikiLinkTarget = (linkText, notes, notePaths = EMPTY_NOTE_PATHS) => (
    resolveWikiLink(linkText, notes, notePaths).note
)

const buildDefaultLabel = (title, anchor) => {
    if (!anchor) return title
    if (!title) return `${WIKI_LINK_ANCHOR_SEPARATOR}${anchor}`
    return `${title}${WIKI_LINK_ANCHOR_LABEL_SEPARATOR}${anchor}`
}

export const unwrapWikiLinks = (value) => mapOutsideCode(
    value,
    (segment) => segment.replace(
        WIKI_LINK_PATTERN,
        (_, linkText, alias) => {
            const { target, anchor } = resolveWikiLink(linkText, [], new Map())
            const { title } = parseWikiLinkText(target)
            return escapeHtml((alias || buildDefaultLabel(title, anchor)).trim())
        }
    )
)

export const renderWikiLink = (alias, { path: notePath, target, anchor }) => {
    const { path, title } = parseWikiLinkText(target)

    if (!title.trim() && !notePath) return escapeHtml((alias || anchor).trim())

    const defaultLabel = buildDefaultLabel(title, anchor)
    const label = escapeHtml((alias || defaultLabel).trim())

    if (!notePath && isFileLinkTarget(target)) {
        return fillTemplate(ANCHOR_TEMPLATE, {
            href: buildFileLinkUrl(target),
            className: FILE_LINK_CLASS,
            label: escapeHtml((alias || title).trim())
        })
    }

    if (!notePath) {
        const encodedPath = encodeURIComponent(path)
        const encodedTitle = encodeURIComponent(title)
        const missingHref = `${WIKI_LINK_SCHEME}${WIKI_LINK_MISSING_PREFIX}${encodedPath}/${encodedTitle}`
        return fillTemplate(ANCHOR_TEMPLATE, { href: missingHref, className: WIKI_LINK_BROKEN_CLASS, label })
    }

    const anchorSuffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${encodeURIComponent(anchor)}` : ''

    return fillTemplate(ANCHOR_TEMPLATE, {
        href: `${WIKI_LINK_SCHEME}${encodeURIComponent(notePath)}${anchorSuffix}`,
        className: WIKI_LINK_CLASS,
        label
    })
}

export const resolveWikiLinkDetails = (linkText, notes, notePaths, selfPath) => {
    const { note, target, anchor } = resolveWikiLink(linkText, notes, notePaths, selfPath)

    return { path: note ? note.path : null, target, anchor }
}

export const parseMissingWikiLinkTarget = (encoded) => {
    const separatorIndex = encoded.indexOf('/')

    return {
        path: decodeURIComponent(encoded.slice(0, separatorIndex)),
        title: decodeURIComponent(encoded.slice(separatorIndex + 1))
    }
}

const NAMES_FIELD_SEPARATOR = '\u0001'
const NAMES_NOTE_SEPARATOR = '\u0002'
const NO_BACKLINKS = []
const NO_TARGETS = []
const linkTargetsCache = new WeakMap()
const backlinkIndexCache = new WeakMap()
const resolvedTargetsCache = new WeakMap()

const getLinkTargets = (note) => {
    const body = note.note || ''

    const cached = linkTargetsCache.get(note)
    if (cached?.body === body) return cached

    const entry = {
        body,
        wiki: body.includes(WIKI_LINK_OPEN)
            ? Array.from(body.matchAll(WIKI_LINK_PATTERN), (match) => match[1])
            : NO_TARGETS,
        markdown: body.includes(MARKDOWN_WIKI_LINK_OPENING)
            ? Array.from(body.matchAll(MARKDOWN_WIKI_LINK_PATTERN), (match) => match[2])
            : NO_TARGETS
    }

    linkTargetsCache.set(note, entry)

    return entry
}

const getNamesSignature = (notes) => notes.map((note) => (
    `${note.title}${NAMES_FIELD_SEPARATOR}${getAliases(note).join(NAMES_FIELD_SEPARATOR)}`
)).join(NAMES_NOTE_SEPARATOR)

const getBacklinkIndex = (notes, notePaths) => {
    const cached = backlinkIndexCache.get(notes)
    if (cached?.notePaths === notePaths) return cached.index

    const index = new Map()
    const resolvedPaths = new Map()
    const signature = getNamesSignature(notes)

    const resolvePath = (linkText) => {
        if (!resolvedPaths.has(linkText)) {
            resolvedPaths.set(linkText, resolveWikiLinkTarget(linkText, notes, notePaths)?.path)
        }

        return resolvedPaths.get(linkText)
    }

    const resolveTargets = (note) => {
        const { body, wiki, markdown } = getLinkTargets(note)
        const known = resolvedTargetsCache.get(note)

        if (known?.body === body && known.signature === signature && known.notePaths === notePaths) {
            return known.targets
        }

        const targets = new Set(markdown)

        for (const linkText of wiki) {
            const path = resolvePath(linkText)
            if (path) targets.add(path)
        }

        targets.delete(note.path)
        const list = [...targets]
        resolvedTargetsCache.set(note, { body, signature, notePaths, targets: list })

        return list
    }

    for (const note of notes) {
        for (const path of resolveTargets(note)) pushTo(index, path, note)
    }

    backlinkIndexCache.set(notes, { notePaths, index })

    return index
}

export const findBacklinks = (targetPath, notes, notePaths = EMPTY_NOTE_PATHS) => (
    getBacklinkIndex(notes, notePaths).get(targetPath) || NO_BACKLINKS
)

export const renameWikiLinksForNote = (
    content,
    targetPath,
    newTitle,
    notes,
    notePaths = EMPTY_NOTE_PATHS,
    resolvePaths = notePaths
) => {
    if (!content) return content

    const folderPath = notePaths.get(targetPath) || ''
    const normalizedNewTitle = normalizeName(newTitle)
    const isAmbiguous = folderPath && notes.some((note) => (
        note.path !== targetPath && normalizeName(note.title || '') === normalizedNewTitle
    ))
    const qualifiedTitle = isAmbiguous ? `${folderPath}/${newTitle}` : newTitle

    return content.replace(WIKI_LINK_PATTERN, (match, linkText, alias) => {
        const { note, target, anchor } = resolveWikiLink(linkText, notes, resolvePaths)
        if (note?.path !== targetPath) return match
        if (normalizeName(parseWikiLinkText(target).title) !== normalizeName(note.title || '')) return match

        const suffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${anchor}` : ''
        if (alias !== undefined) return `[[${qualifiedTitle}${suffix}|${alias}]]`
        if (!isAmbiguous) return `[[${newTitle}${suffix}]]`

        const label = anchor ? `${newTitle}${WIKI_LINK_ANCHOR_LABEL_SEPARATOR}${anchor}` : newTitle
        return `[[${qualifiedTitle}${suffix}|${label}]]`
    })
}

export const buildBacklinkLink = (note, notePaths) => {
    const path = notePaths.get(note.path) || ''

    return fillTemplate(BACKLINK_LINK_TEMPLATE, {
        href: `${WIKI_LINK_SCHEME}${encodeURIComponent(note.path)}`,
        linkClass: WIKI_LINK_CLASS,
        titleClass: BACKLINK_TITLE_CLASS,
        title: escapeHtml(note.title || ''),
        path: path ? fillTemplate(BACKLINK_PATH_TEMPLATE, { className: BACKLINK_PATH_CLASS, path: escapeHtml(path) }) : ''
    })
}

export const buildBacklinksHtml = (backlinks, label, notePaths = EMPTY_NOTE_PATHS) => {
    if (!backlinks.length) return ''

    const items = backlinks
        .map((note) => fillTemplate(BACKLINK_ITEM_TEMPLATE, { link: buildBacklinkLink(note, notePaths) }))
        .join('')

    return fillTemplate(BACKLINKS_TEMPLATE, {
        className: BACKLINKS_CLASS,
        titleClass: BACKLINKS_TITLE_CLASS,
        label: escapeHtml(label),
        items
    })
}
