import { escapeHtml } from '../../../utils/wiki-links'
import { buildFileLinkUrl } from '../../../utils/file-links'
import { buildIconMarkup } from './icon-mask'

import { OPEN_IN_NEW_FILLED_ICON_PATH } from '@/constants/icon-paths'
import { FILE_LINK_CLASS } from '@/constants/file-links'
import { WIKI_LINK_SCHEME, WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'
import { FILE_KINDS } from '@/constants/file-types'
import {
    EMBED_CLASS,
    EMBED_OPEN_CLASS,
    EMBED_OPEN_ICON_SIZE,
    EMBED_PDF_CLASS,
    EMBED_PLAYER_PRELOAD,
    EMBED_TITLE_CLASS,
    EMBED_WIDTH_PATTERN
} from '@/constants/embeds'

export const buildMediaHtml = ({ name, kind, page }, width, url, { markdownImage = false } = {}) => {
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

    if (markdownImage && !sized) return `![${name}](${url})`

    return `<img src="${src}" alt="${escapeHtml(name)}"${sized}>`
}

const buildOpenLink = (path, anchor) => {
    const suffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${encodeURIComponent(anchor)}` : ''
    const href = `${WIKI_LINK_SCHEME}${encodeURIComponent(path)}${suffix}`
    const icon = buildIconMarkup(OPEN_IN_NEW_FILLED_ICON_PATH, EMBED_OPEN_ICON_SIZE)

    return `<a href="${href}" class="${EMBED_OPEN_CLASS}">${icon}</a>`
}

export const buildEmbedBlockHtml = ({ title, body, path, anchor, withOpenLink }) => {
    const openLink = withOpenLink ? buildOpenLink(path, anchor) : ''
    const head = `<div class="${EMBED_TITLE_CLASS}"><span>${escapeHtml(title)}</span>${openLink}</div>`

    return `\n\n<div class="${EMBED_CLASS}">${head}\n\n${body}\n\n</div>\n\n`
}
