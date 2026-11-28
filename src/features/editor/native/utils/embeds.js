import { resolveWikiLink } from '@/shared/utils/wiki-links'
import { mapOutsideCode } from '@/shared/utils/outside-code'
import { bodyOf } from '@/shared/utils/note-body-of'
import { isFileLinkTarget } from '@/shared/utils/file-links'
import { buildEmbedBlockHtml, buildMediaHtml } from '../../shared/utils/embed-html'
import { extractEmbedSource } from './embed-source'
import { parseEmbedMedia } from '../../shared/utils/embed-media'

import { FILE_KINDS } from '@/shared/constants/file-types'
import { EMBED_PATTERN, EMBED_MAX_DEPTH, EMBED_OPENING } from '@/shared/constants/embeds'

const replaceEmbeds = (value, context, depth, visited) => mapOutsideCode(
    value,
    (segment) => segment.replace(
        EMBED_PATTERN,
        (match, linkText, alias) => {
            const target = linkText.trim()

            const media = parseEmbedMedia(target)

            if (media.kind) {
                const url = context.getMediaUrl(media.name)

                return (url && buildMediaHtml(media, alias, url, { markdownImage: true })) || match.slice(1)
            }

            if (isFileLinkTarget(target)) return match.slice(1)

            const { note, anchor } = resolveWikiLink(target, context.notes, context.folderPathByNote, context.selfPath)
            if (!note || depth >= EMBED_MAX_DEPTH || visited.has(note.path)) return match.slice(1)

            const source = extractEmbedSource(bodyOf(note, context.bodies), anchor)
            if (source === null) return match.slice(1)

            const body = replaceEmbeds(source, context, depth + 1, new Set([...visited, note.path]))

            return buildEmbedBlockHtml({
                title: note.title || '',
                body,
                path: note.path,
                anchor,
                withOpenLink: context.withOpenLink
            })
        }
    )
)

export const resolveEmbeds = (
    value,
    { notes, folderPathByNote = new Map(), getMediaUrl, selfPath, withOpenLink = false, bodies }
) => (
    !value.includes(EMBED_OPENING) ? value : replaceEmbeds(
        value,
        { notes, folderPathByNote, getMediaUrl, selfPath, withOpenLink, bodies },
        0,
        new Set(selfPath ? [selfPath] : [])
    )
)

const extractEmbedNames = (value, accepts) => {
    if (!value.includes(EMBED_OPENING)) return []

    const names = new Set()

    mapOutsideCode(value, (segment) => {
        for (const match of segment.matchAll(EMBED_PATTERN)) {
            const { name, kind } = parseEmbedMedia(match[1].trim())
            if (accepts(kind)) names.add(name)
        }

        return segment
    })

    return [...names]
}

export const extractEmbedImageNames = (value) => extractEmbedNames(value, (kind) => kind === FILE_KINDS.IMAGE)


const findNoteEmbeds = (text, { notes, folderPathByNote, selfPath }) => {
    const found = []

    mapOutsideCode(text, (segment) => {
        for (const match of segment.matchAll(EMBED_PATTERN)) {
            const target = match[1].trim()
            if (parseEmbedMedia(target).kind || isFileLinkTarget(target)) continue

            const { note, anchor } = resolveWikiLink(target, notes, folderPathByNote, selfPath)
            if (note && note.path !== selfPath) found.push({ note, anchor })
        }

        return segment
    })

    return found
}

export const collectEmbedBodies = async (value, { notes, folderPathByNote, selfPath, loadBodies }) => {
    const bodies = new Map()
    let texts = [value]

    for (let depth = 0; depth < EMBED_MAX_DEPTH && texts.length; depth += 1) {
        const embeds = texts.flatMap((text) => findNoteEmbeds(text, { notes, folderPathByNote, selfPath }))
        if (!embeds.length) break

        const loaded = await loadBodies(embeds.map(({ note }) => note))
        loaded.forEach((body, path) => bodies.set(path, body))

        texts = embeds
            .map(({ note, anchor }) => extractEmbedSource(loaded.get(note.path) ?? '', anchor))
            .filter((text) => text !== null)
    }

    return bodies
}
