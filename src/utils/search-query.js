const DATE_QUALIFIER_REGEX = /\b(modified|created):(\d{4}-\d{2}-\d{2})\b/i
const TAG_QUALIFIER_REGEX = /\btag:"([^"]+)"|\btag:(\S+)/gi
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\([^)]+\)/

export const parseSearchQuery = (query) => {
    let text = query
    let tags = []
    let pinned = false
    let hasImage = false
    let modified = null
    let created = null

    text = text.replace(/\bis:pinned\b/i, () => {
        pinned = true
        return ''
    })

    text = text.replace(/\bhas:image\b/i, () => {
        hasImage = true
        return ''
    })

    text = text.replace(DATE_QUALIFIER_REGEX, (match, field, date) => {
        if (field.toLowerCase() === 'modified') modified = date
        else created = date
        return ''
    })

    text = text.replace(TAG_QUALIFIER_REGEX, (match, quoted, bare) => {
        tags.push((quoted || bare).toLowerCase())
        return ''
    })

    return { text: text.trim().toLowerCase(), tags, pinned, hasImage, modified, created }
}

const toDateKey = (timestamp) => (timestamp ? new Date(timestamp).toISOString().slice(0, 10) : null)

export const toggleTagQualifier = (query, tagName) => {
    const target = tagName.toLowerCase()
    const existingTags = []

    const withoutTags = query.replace(TAG_QUALIFIER_REGEX, (match, quoted, bare) => {
        existingTags.push(quoted || bare)
        return ''
    }).trim()

    const isActive = existingTags.some((name) => name.toLowerCase() === target)

    const nextTags = isActive
        ? existingTags.filter((name) => name.toLowerCase() !== target)
        : [...existingTags, tagName]

    const qualifiers = nextTags
        .map((name) => (/\s/.test(name) ? `tag:"${name}"` : `tag:${name}`))
        .join(' ')

    if (!withoutTags) return qualifiers
    if (!qualifiers) return withoutTags
    return `${withoutTags} ${qualifiers}`
}

export const togglePinnedQualifier = (query) => {
    if (/\bis:pinned\b/i.test(query)) {
        return query.replace(/\bis:pinned\b/i, '').trim()
    }

    return query ? `${query} is:pinned` : 'is:pinned'
}

export const toggleImageQualifier = (query) => {
    if (/\bhas:image\b/i.test(query)) {
        return query.replace(/\bhas:image\b/i, '').trim()
    }

    return query ? `${query} has:image` : 'has:image'
}

export const filterNotes = (notes, query, { tags, pinned }) => {
    const parsed = parseSearchQuery(query)
    const tagIds = parsed.tags
        .map((name) => tags.find((t) => t.name.toLowerCase() === name)?.id)
        .filter(Boolean)

    return notes.filter((note) => {
        if (parsed.pinned && !pinned.has(note.id)) return false
        if (tagIds.length > 0 && !tagIds.some((id) => note.tags?.includes(id))) return false
        if (parsed.hasImage && !MARKDOWN_IMAGE_REGEX.test(note.note || '')) return false
        if (parsed.modified && toDateKey(note.updatedAt) !== parsed.modified) return false
        if (parsed.created && toDateKey(note.createdAt) !== parsed.created) return false
        if (parsed.text && !note.title.toLowerCase().includes(parsed.text)) return false
        return true
    })
}
