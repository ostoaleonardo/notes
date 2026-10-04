import { parseMissingWikiLinkTarget } from '@/utils/wiki-links'

import { LINK_TYPES } from '@/constants/link-types'
import { TAG_LINK_SCHEME } from '@/constants/tags'
import {
    WIKI_LINK_SCHEME,
    WIKI_LINK_MISSING_PREFIX,
    WIKI_LINK_ANCHOR_SEPARATOR
} from '@/constants/wiki-links'
import { FILE_LINK_SCHEME } from '@/constants/file-links'

export const resolveLinkPress = (url) => {
    if (!url) return null

    if (url.startsWith(TAG_LINK_SCHEME)) {
        return { type: LINK_TYPES.TAG, tag: decodeURIComponent(url.slice(TAG_LINK_SCHEME.length)) }
    }

    if (url.startsWith(FILE_LINK_SCHEME)) {
        return { type: LINK_TYPES.FILE, target: decodeURIComponent(url.slice(FILE_LINK_SCHEME.length)) }
    }

    if (url.startsWith(WIKI_LINK_SCHEME)) {
        const target = url.slice(WIKI_LINK_SCHEME.length)

        if (target.startsWith(WIKI_LINK_MISSING_PREFIX)) {
            return {
                type: LINK_TYPES.MISSING_NOTE,
                missing: parseMissingWikiLinkTarget(target.slice(WIKI_LINK_MISSING_PREFIX.length))
            }
        }

        const separator = target.indexOf(WIKI_LINK_ANCHOR_SEPARATOR)
        if (separator === -1) return { type: LINK_TYPES.NOTE, id: decodeURIComponent(target) }

        return {
            type: LINK_TYPES.NOTE,
            id: decodeURIComponent(target.slice(0, separator)),
            anchor: decodeURIComponent(target.slice(separator + 1))
        }
    }

    return { type: LINK_TYPES.EXTERNAL, url }
}
