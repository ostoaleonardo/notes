import { resolveWikiLink, escapeHtml } from './wiki-links'
import { mapOutsideCode } from './outside-code'
import { isFileLinkTarget } from './file-links'
import { extractBlock } from './block-refs'
import { extractSection } from './headings'
import { buildIconMarkup } from './icon-mask'
import { parseEmbedMedia } from './embed-media'
import { buildFileLinkUrl } from './file-links'

import { BLOCK_ANCHOR_PREFIX } from '@/constants/block-refs'
import { OPEN_IN_NEW_FILLED_ICON_PATH } from '@/constants/icon-paths'
import { FILE_LINK_CLASS } from '@/constants/file-links'
import { WIKI_LINK_SCHEME, WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'
import { FILE_KINDS } from '@/constants/file-types'

import {
    EMBED_CLASS,
    EMBED_TITLE_CLASS,
    EMBED_OPEN_CLASS,
    EMBED_OPEN_ICON_SIZE,
    EMBED_PATTERN,
    EMBED_PDF_CLASS,
    EMBED_PLAYER_PRELOAD,
    EMBED_WIDTH_PATTERN,
    EMBED_MAX_DEPTH
} from '@/constants/embeds'

const buildMedia = ({ name, kind, page }, width, getMediaUrl) => {
    const url = getMediaUrl(name)
    if (!url) return null

    const src = escapeHtml(url)

    if (kind === FILE_KINDS.PDF) {
        const classes = `${FILE_LINK_CLASS} ${EMBED_PDF_CLASS}`

        return `<a href="${buildFileLinkUrl(name)}" class="${classes}" data-pdf="${src}" data-page="${page}">${escapeHtml(name)}</a>`
    }

    if (kind === FILE_KINDS.AUDIO) {
        return `<audio controls preload="${EMBED_PLAYER_PRELOAD}" src="${src}"></audio>`
    }

    const sized = width && EMBED_WIDTH_PATTERN.test(width) ? ` width="${width}"` : ''

    if (kind === FILE_KINDS.VIDEO) {
        return `<video controls preload="${EMBED_PLAYER_PRELOAD}" src="${src}"${sized}></video>`
    }

    return sized ? `<img src="${src}" alt="${escapeHtml(name)}"${sized}>` : `![${name}](${url})`
}

const buildOpenLink = (note, anchor) => {
    const suffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${encodeURIComponent(anchor)}` : ''
    const href = `${WIKI_LINK_SCHEME}${encodeURIComponent(note.path)}${suffix}`

    const icon = buildIconMarkup(OPEN_IN_NEW_FILLED_ICON_PATH, EMBED_OPEN_ICON_SIZE)

    return `<a href="${href}" class="${EMBED_OPEN_CLASS}">${icon}</a>`
}

const extractSource = (text, anchor) => {
    if (!anchor) return text
    if (anchor.startsWith(BLOCK_ANCHOR_PREFIX)) return extractBlock(text, anchor.slice(BLOCK_ANCHOR_PREFIX.length))
    return extractSection(text, anchor)
}

const replaceEmbeds = (value, context, depth, visited) => mapOutsideCode(
    value,
    (segment) => segment.replace(
        EMBED_PATTERN,
        (match, linkText, alias) => {
            const target = linkText.trim()

            const media = parseEmbedMedia(target)

            if (media.kind) return buildMedia(media, alias, context.getMediaUrl) ?? match.slice(1)

            if (isFileLinkTarget(target)) return match.slice(1)

            const { note, anchor } = resolveWikiLink(target, context.notes, context.notePaths, context.selfPath)
            if (!note || depth >= EMBED_MAX_DEPTH || visited.has(note.path)) return match.slice(1)

            const source = extractSource(note.note || '', anchor)
            if (source === null) return match.slice(1)

            const body = replaceEmbeds(source, context, depth + 1, new Set([...visited, note.path]))
            const title = escapeHtml(note.title || '')
            const openLink = context.withOpenLink ? buildOpenLink(note, anchor) : ''

            return `\n\n<div class="${EMBED_CLASS}"><div class="${EMBED_TITLE_CLASS}"><span>${title}</span>${openLink}</div>\n\n${body}\n\n</div>\n\n`
        }
    )
)

export const resolveEmbeds = (value, { notes, notePaths = new Map(), getMediaUrl, selfPath, withOpenLink = false }) => (
    replaceEmbeds(
        value,
        { notes, notePaths, getMediaUrl, selfPath, withOpenLink },
        0,
        new Set(selfPath ? [selfPath] : [])
    )
)

const extractEmbedNames = (value, accepts) => {
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
