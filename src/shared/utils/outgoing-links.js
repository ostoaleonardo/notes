import { isFileLinkTarget } from '@/shared/utils/file-links'
import { extractWikiLinkTexts } from '@/shared/utils/note-links'
import { resolveWikiLink } from '@/shared/utils/wiki-links'

import { MISSING_LINK_KEY_PREFIX } from '@/shared/constants/outgoing-links'

export const resolveOutgoingLinks = (linkTexts, selfPath, notes, folderPathByNote = new Map()) => {
    const links = new Map()

    linkTexts.forEach((linkText) => {
        const { note, target } = resolveWikiLink(linkText, notes, folderPathByNote, selfPath)
        const name = target.trim()

        if (note?.path === selfPath || !name) return
        if (!note && isFileLinkTarget(name)) return

        const key = note ? note.path : `${MISSING_LINK_KEY_PREFIX}${name.toLowerCase()}`
        if (!links.has(key)) links.set(key, { key, path: note?.path, title: note ? note.title : name })
    })

    return [...links.values()]
}

export const findOutgoingLinks = (content, selfPath, notes, folderPathByNote) => (
    resolveOutgoingLinks(extractWikiLinkTexts(content), selfPath, notes, folderPathByNote)
)
