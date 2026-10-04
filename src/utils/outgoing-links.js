import { isFileLinkTarget } from '@/utils/file-links'
import { mapOutsideCode } from '@/utils/outside-code'
import { resolveWikiLink } from '@/utils/wiki-links'

import { MISSING_LINK_KEY_PREFIX } from '@/constants/outgoing-links'
import { WIKI_LINK_PATTERN } from '@/constants/wiki-links'

export const findOutgoingLinks = (content, selfPath, notes, notePaths = new Map()) => {
    const links = new Map()

    mapOutsideCode(content || '', (segment) => segment.replace(WIKI_LINK_PATTERN, (match, linkText) => {
        const { note, target } = resolveWikiLink(linkText, notes, notePaths, selfPath)
        const name = target.trim()

        if (note?.path === selfPath || !name) return match
        if (!note && isFileLinkTarget(name)) return match

        const key = note ? note.path : `${MISSING_LINK_KEY_PREFIX}${name.toLowerCase()}`
        if (!links.has(key)) links.set(key, { key, path: note?.path, title: note ? note.title : name })

        return match
    }))

    return [...links.values()]
}
