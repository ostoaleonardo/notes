import {
    WIKI_LINK_ANCHOR_LABEL_SEPARATOR,
    WIKI_LINK_ANCHOR_SEPARATOR,
    WIKI_LINK_PATTERN
} from '@/shared/constants/wiki-links'
import { resolveWikiLink, resolveWikiLinkTarget } from '@/shared/utils/wiki-links'

const normalizeName = (text) => text.normalize('NFC').trim().toLowerCase()

const titleOf = (target) => {
    const trimmed = (target || '').trim()

    return trimmed.slice(trimmed.lastIndexOf('/') + 1)
}

const toNotes = (titles, aliases, paths) => paths.map((path, index) => ({
    path,
    title: titles[index],
    properties: { aliases: aliases[index] }
}))

const MARKDOWN_TARGET_PATTERN = /\]\(wikilink:\/\/([^)]+)\)/g

export const findBacklinkPaths = (
    titles,
    aliases,
    paths,
    folders,
    targetPath,
    candidatePaths,
    candidateBodies
) => {
    const notes = toNotes(titles, aliases, paths)
    const notePaths = new Map(Object.entries(folders))

    return candidatePaths.filter((path, index) => {
        if (path === targetPath) return false

        const body = candidateBodies[index]
        const markdown = Array.from(body.matchAll(MARKDOWN_TARGET_PATTERN), (match) => match[1])
        const wiki = Array.from(body.matchAll(WIKI_LINK_PATTERN), (match) => match[1])

        return markdown.includes(targetPath) || wiki.some((text) => (
            resolveWikiLinkTarget(text, notes, notePaths)?.path === targetPath
        ))
    })
}

export const renameWikiLinksForNote = (
    content,
    targetPath,
    newTitle,
    notes,
    notePaths = new Map(),
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
        if (normalizeName(titleOf(target)) !== normalizeName(note.title || '')) return match

        const suffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${anchor}` : ''
        if (alias !== undefined) return `[[${qualifiedTitle}${suffix}|${alias}]]`
        if (!isAmbiguous) return `[[${newTitle}${suffix}]]`

        const label = anchor ? `${newTitle}${WIKI_LINK_ANCHOR_LABEL_SEPARATOR}${anchor}` : newTitle
        return `[[${qualifiedTitle}${suffix}|${label}]]`
    })
}

export const renameLinksInBodies = (
    titles,
    aliases,
    paths,
    folders,
    resolveFolders,
    targetPath,
    newTitle,
    bodies
) => {
    const notes = toNotes(titles, aliases, paths)
    const notePaths = new Map(Object.entries(folders))
    const resolvePaths = resolveFolders ? new Map(Object.entries(resolveFolders)) : notePaths

    return bodies.map((body) => (
        renameWikiLinksForNote(body, targetPath, newTitle, notes, notePaths, resolvePaths)
    ))
}
