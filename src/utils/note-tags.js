import { extractInlineTags } from './inline-tags'
import { dedupeTags } from './tag-names'

import { TAG_PATH_SEPARATOR } from '@/constants/tags'

const cache = new WeakMap()

export const getNoteTags = (note) => {
    let tags = cache.get(note)

    if (!tags) {
        tags = dedupeTags([...(note.tags || []), ...extractInlineTags(note.note)])
        cache.set(note, tags)
    }

    return tags
}

const withParents = (tag) => {
    const segments = tag.split(TAG_PATH_SEPARATOR)
    return segments.map((_, index) => segments.slice(0, index + 1).join(TAG_PATH_SEPARATOR))
}

export const collectTags = (notes) => (
    dedupeTags(notes.flatMap(getNoteTags).flatMap(withParents)).sort((a, b) => a.localeCompare(b))
)
