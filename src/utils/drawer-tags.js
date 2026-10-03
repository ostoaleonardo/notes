import { hasTag, tagKey } from './tag-names'

export const buildDrawerTagRows = (tags, notes, expandedTag) => {
    const counts = new Map()

    for (const note of notes) {
        for (const key of new Set((note.tags || []).map(tagKey))) {
            counts.set(key, (counts.get(key) || 0) + 1)
        }
    }

    return tags.flatMap((name) => {
        const expanded = !!expandedTag && tagKey(name) === tagKey(expandedTag)
        const row = {
            type: 'tag',
            id: 'tag:' + tagKey(name),
            name,
            count: counts.get(tagKey(name)) || 0,
            expanded
        }

        if (!expanded) return [row]

        const noteRows = notes
            .filter((note) => hasTag(note.tags || [], name))
            .map((note) => ({ type: 'note', id: `tag-note:${tagKey(name)}:${note.path}`, note, depth: 1 }))

        return [row, ...noteRows]
    })
}
