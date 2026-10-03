export const tagKey = (name) => name.toLowerCase()

export const isSameTag = (a, b) => tagKey(a) === tagKey(b)

export const hasTag = (tags, name) => tags.some((tag) => isSameTag(tag, name))

export const dedupeTags = (tags) => {
    const seen = new Set()

    return tags.filter((tag) => {
        const key = tagKey(tag)
        if (seen.has(key)) return false

        seen.add(key)
        return true
    })
}

export const reconcileTags = (dictionary, notes) => {
    const noteTags = notes.flatMap((note) => note.tags || [])
    const tags = dedupeTags([...dictionary, ...noteTags])

    return { tags, changed: tags.length !== dictionary.length }
}
