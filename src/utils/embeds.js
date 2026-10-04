import { resolveWikiLink, escapeHtml } from './wiki-links'
import { mapOutsideCode } from './outside-code'
import { isFileLinkTarget } from './file-links'
import { extractBlock } from './block-refs'

import { BLOCK_ANCHOR_PREFIX } from '@/constants/block-refs'

import {
    EMBED_CLASS,
    EMBED_TITLE_CLASS,
    EMBED_PATTERN,
    EMBED_IMAGE_PATTERN,
    EMBED_WIDTH_PATTERN,
    EMBED_MAX_DEPTH
} from '@/constants/embeds'

const buildImage = (name, width, getImageUrl) => {
    const url = getImageUrl(name)
    if (!url) return null

    if (width && EMBED_WIDTH_PATTERN.test(width)) {
        return `<img src="${escapeHtml(url)}" alt="${escapeHtml(name)}" width="${width}">`
    }

    return `![${name}](${url})`
}

const replaceEmbeds = (value, context, depth, visited) => mapOutsideCode(
    value,
    (segment) => segment.replace(
        EMBED_PATTERN,
        (match, linkText, alias) => {
            const target = linkText.trim()

            if (EMBED_IMAGE_PATTERN.test(target)) {
                return buildImage(target, alias, context.getImageUrl) ?? match.slice(1)
            }

            if (isFileLinkTarget(target)) return match.slice(1)

            const { note, anchor } = resolveWikiLink(target, context.notes, context.notePaths)
            if (!note || depth >= EMBED_MAX_DEPTH || visited.has(note.path)) return match.slice(1)

            const source = anchor.startsWith(BLOCK_ANCHOR_PREFIX)
                ? extractBlock(note.note, anchor.slice(BLOCK_ANCHOR_PREFIX.length))
                : note.note || ''
            if (source === null) return match.slice(1)

            const body = replaceEmbeds(source, context, depth + 1, new Set([...visited, note.path]))
            const title = escapeHtml(note.title || '')

            return `\n\n<div class="${EMBED_CLASS}"><div class="${EMBED_TITLE_CLASS}">${title}</div>\n\n${body}\n\n</div>\n\n`
        }
    )
)

export const resolveEmbeds = (value, { notes, notePaths = new Map(), getImageUrl, selfPath }) => (
    replaceEmbeds(value, { notes, notePaths, getImageUrl }, 0, new Set(selfPath ? [selfPath] : []))
)

export const extractEmbedImageNames = (value) => {
    const names = new Set()

    mapOutsideCode(value, (segment) => {
        for (const match of segment.matchAll(EMBED_PATTERN)) {
            const target = match[1].trim()
            if (EMBED_IMAGE_PATTERN.test(target)) names.add(target)
        }

        return segment
    })

    return [...names]
}
