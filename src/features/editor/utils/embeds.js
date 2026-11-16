import { resolveWikiLink } from '../../../utils/wiki-links'
import { mapOutsideCode } from '../../../utils/outside-code'
import { isFileLinkTarget } from '../../../utils/file-links'
import { buildEmbedBlockHtml, buildMediaHtml } from './embed-html'
import { extractEmbedSource } from './embed-source'
import { parseEmbedMedia } from './embed-media'

import { FILE_KINDS } from '@/constants/file-types'
import { EMBED_PATTERN, EMBED_MAX_DEPTH, EMBED_OPENING } from '@/constants/embeds'

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

            const { note, anchor } = resolveWikiLink(target, context.notes, context.notePaths, context.selfPath)
            if (!note || depth >= EMBED_MAX_DEPTH || visited.has(note.path)) return match.slice(1)

            const source = extractEmbedSource(note.note || '', anchor)
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

export const resolveEmbeds = (value, { notes, notePaths = new Map(), getMediaUrl, selfPath, withOpenLink = false }) => (
    !value.includes(EMBED_OPENING) ? value : replaceEmbeds(
        value,
        { notes, notePaths, getMediaUrl, selfPath, withOpenLink },
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

export const extractEmbedMediaNames = (value, { pdf = false } = {}) => (
    extractEmbedNames(value, (kind) => !!kind && (pdf || kind !== FILE_KINDS.PDF))
)
