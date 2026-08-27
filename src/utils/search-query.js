export const parseSearchQuery = (query) => {
    let text = query
    let tag = null
    let pinned = false

    text = text.replace(/\bis:pinned\b/i, () => {
        pinned = true
        return ''
    })

    text = text.replace(/\btag:"([^"]+)"|\btag:(\S+)/i, (match, quoted, bare) => {
        tag = (quoted || bare).toLowerCase()
        return ''
    })

    return { text: text.trim().toLowerCase(), tag, pinned }
}

export const toggleTagQualifier = (query, tagName) => {
    const current = parseSearchQuery(query).tag
    const withoutTag = query.replace(/\btag:"([^"]+)"|\btag:(\S+)/i, '').trim()

    if (current === tagName.toLowerCase()) return withoutTag

    const qualifier = /\s/.test(tagName) ? `tag:"${tagName}"` : `tag:${tagName}`
    return withoutTag ? `${withoutTag} ${qualifier}` : qualifier
}

export const togglePinnedQualifier = (query) => {
    if (/\bis:pinned\b/i.test(query)) {
        return query.replace(/\bis:pinned\b/i, '').trim()
    }

    return query ? `${query} is:pinned` : 'is:pinned'
}

export const filterNotes = (notes, query, { tags, pinned }) => {
    const parsed = parseSearchQuery(query)
    const tagId = parsed.tag && tags.find((t) => t.name.toLowerCase() === parsed.tag)?.id

    return notes.filter((note) => {
        if (parsed.pinned && !pinned.has(note.id)) return false
        if (parsed.tag && !note.tags?.includes(tagId)) return false
        if (parsed.text && !note.title.toLowerCase().includes(parsed.text)) return false
        return true
    })
}
