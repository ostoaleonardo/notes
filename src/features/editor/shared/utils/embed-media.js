import {
    EMBED_AUDIO_PATTERN,
    EMBED_IMAGE_PATTERN,
    EMBED_PDF_DEFAULT_PAGE,
    EMBED_PDF_PAGE_PATTERN,
    EMBED_PDF_PATTERN,
    EMBED_VIDEO_PATTERN
} from '@/constants/embeds'
import { FILE_KINDS } from '@/constants/file-types'
import { WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'

const getKind = (name) => {
    if (EMBED_IMAGE_PATTERN.test(name)) return FILE_KINDS.IMAGE
    if (EMBED_AUDIO_PATTERN.test(name)) return FILE_KINDS.AUDIO
    if (EMBED_VIDEO_PATTERN.test(name)) return FILE_KINDS.VIDEO
    if (EMBED_PDF_PATTERN.test(name)) return FILE_KINDS.PDF

    return null
}

const getPdfPage = (anchor) => {
    const match = anchor.match(EMBED_PDF_PAGE_PATTERN)
    const page = match ? Number(match[1]) : 0

    return page > 0 ? page : EMBED_PDF_DEFAULT_PAGE
}

export const parseEmbedMedia = (target) => {
    const anchorIndex = target.indexOf(WIKI_LINK_ANCHOR_SEPARATOR)
    const name = anchorIndex === -1 ? target : target.slice(0, anchorIndex)
    const anchor = anchorIndex === -1 ? '' : target.slice(anchorIndex + 1)
    const kind = getKind(name)

    return { name, kind, page: kind === FILE_KINDS.PDF ? getPdfPage(anchor) : null }
}
