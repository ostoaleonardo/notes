import { getFileKind } from '@/utils/attachments'

import { FILE_LINK_SCHEME } from '@/constants/file-links'
import { WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'

const getFileLinkName = (linkText) => (
    linkText.split(WIKI_LINK_ANCHOR_SEPARATOR)[0].trim()
)

export const isFileLinkTarget = (linkText) => !!getFileKind(getFileLinkName(linkText))

export const buildFileLinkUrl = (linkText) => (
    FILE_LINK_SCHEME + encodeURIComponent(getFileLinkName(linkText))
)
