import { mapOutsideCode } from '@/utils/outside-code'

import { WIKI_LINK_PATTERN } from '@/constants/wiki-links'

const cache = new WeakMap()

export const extractWikiLinkTexts = (content) => {
    const texts = []

    mapOutsideCode(content || '', (segment) => {
        for (const match of segment.matchAll(WIKI_LINK_PATTERN)) texts.push(match[1])

        return segment
    })

    return texts
}

export const getNoteLinkTexts = (note) => {
    let texts = cache.get(note)

    if (!texts) {
        texts = extractWikiLinkTexts(note.note)
        cache.set(note, texts)
    }

    return texts
}

export const seedNoteLinkTexts = (note, texts) => {
    cache.set(note, texts)
}
