import { escapeHtml } from '../../../../shared/utils/wiki-links'
import { buildFileLinkUrl } from '../../../../shared/utils/file-links'
import { buildIconMarkup } from '../../dom/utils/icon-mask'

import { OPEN_IN_NEW_FILLED_ICON_PATH } from '@/shared/constants/icon-paths'
import { FILE_LINK_CLASS } from '@/shared/constants/file-links'
import { WIKI_LINK_SCHEME, WIKI_LINK_ANCHOR_SEPARATOR } from '@/shared/constants/wiki-links'
import { fillTemplate } from '@/shared/utils/fill-template'
import {
    EMBED_AUDIO_TEMPLATE,
    EMBED_BLOCK_TEMPLATE,
    EMBED_HEAD_TEMPLATE,
    EMBED_IMAGE_TEMPLATE,
    EMBED_MARKDOWN_IMAGE_TEMPLATE,
    EMBED_OPEN_LINK_TEMPLATE,
    EMBED_PDF_TEMPLATE,
    EMBED_VIDEO_TEMPLATE,
    EMBED_WIDTH_TEMPLATE
} from '@/features/editor/shared/constants/embed-html'
import { FILE_KINDS } from '@/shared/constants/file-types'
import {
    EMBED_CLASS,
    EMBED_OPEN_CLASS,
    EMBED_OPEN_ICON_SIZE,
    EMBED_PDF_CLASS,
    EMBED_PLAYER_PRELOAD,
    EMBED_TITLE_CLASS,
    EMBED_WIDTH_PATTERN
} from '@/shared/constants/embeds'

const buildWidth = (width) => (
    width && EMBED_WIDTH_PATTERN.test(width) ? fillTemplate(EMBED_WIDTH_TEMPLATE, { width }) : ''
)

export const buildMediaHtml = ({ name, kind, page }, width, url, { markdownImage = false } = {}) => {
    const src = escapeHtml(url)

    if (kind === FILE_KINDS.PDF) {
        return fillTemplate(EMBED_PDF_TEMPLATE, {
            href: buildFileLinkUrl(name),
            classes: `${FILE_LINK_CLASS} ${EMBED_PDF_CLASS}`,
            src,
            page,
            name: escapeHtml(name)
        })
    }

    if (kind === FILE_KINDS.AUDIO) {
        return fillTemplate(EMBED_AUDIO_TEMPLATE, { preload: EMBED_PLAYER_PRELOAD, src })
    }

    if (kind === FILE_KINDS.VIDEO) {
        return fillTemplate(EMBED_VIDEO_TEMPLATE, { preload: EMBED_PLAYER_PRELOAD, src, width: buildWidth(width) })
    }

    const sized = buildWidth(width)

    if (markdownImage && !sized) return fillTemplate(EMBED_MARKDOWN_IMAGE_TEMPLATE, { name, url })

    return fillTemplate(EMBED_IMAGE_TEMPLATE, { src, alt: escapeHtml(name), width: sized })
}

const buildOpenLink = (path, anchor) => {
    const suffix = anchor ? `${WIKI_LINK_ANCHOR_SEPARATOR}${encodeURIComponent(anchor)}` : ''

    return fillTemplate(EMBED_OPEN_LINK_TEMPLATE, {
        href: `${WIKI_LINK_SCHEME}${encodeURIComponent(path)}${suffix}`,
        className: EMBED_OPEN_CLASS,
        icon: buildIconMarkup(OPEN_IN_NEW_FILLED_ICON_PATH, EMBED_OPEN_ICON_SIZE)
    })
}

export const buildEmbedBlockHtml = ({ title, body, path, anchor, withOpenLink }) => {
    const head = fillTemplate(EMBED_HEAD_TEMPLATE, {
        titleClass: EMBED_TITLE_CLASS,
        title: escapeHtml(title),
        openLink: withOpenLink ? buildOpenLink(path, anchor) : ''
    })

    return fillTemplate(EMBED_BLOCK_TEMPLATE, { className: EMBED_CLASS, head, body })
}
