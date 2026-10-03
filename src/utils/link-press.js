import { parseMissingWikiLinkTarget } from '@/utils/wiki-links'

import { LINK_TYPES } from '@/constants/link-types'
import { TAG_LINK_SCHEME } from '@/constants/tags'
import { WIKI_LINK_SCHEME, WIKI_LINK_MISSING_PREFIX } from '@/constants/wiki-links'

export const resolveLinkPress = (url) => {
    if (!url) return null

    if (url.startsWith(TAG_LINK_SCHEME)) {
        return { type: LINK_TYPES.TAG, tag: decodeURIComponent(url.slice(TAG_LINK_SCHEME.length)) }
    }

    if (url.startsWith(WIKI_LINK_SCHEME)) {
        const target = url.slice(WIKI_LINK_SCHEME.length)

        if (target.startsWith(WIKI_LINK_MISSING_PREFIX)) {
            return {
                type: LINK_TYPES.MISSING_NOTE,
                missing: parseMissingWikiLinkTarget(target.slice(WIKI_LINK_MISSING_PREFIX.length))
            }
        }

        return { type: LINK_TYPES.NOTE, id: decodeURIComponent(target) }
    }

    return { type: LINK_TYPES.EXTERNAL, url }
}
