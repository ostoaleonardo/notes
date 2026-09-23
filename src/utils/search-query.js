import {
    DATE_QUALIFIER_REGEX,
    TAG_QUALIFIER_REGEX,
    MARKDOWN_IMAGE_REGEX,
    PINNED_QUALIFIER_REGEX,
    IMAGE_QUALIFIER_REGEX,
    CONTENT_QUALIFIER_REGEX,
    PINNED_QUALIFIER,
    IMAGE_QUALIFIER,
    CONTENT_QUALIFIER
} from '@/constants/search-query'
import { fuzzyMatch } from './fuzzy-match'

export const parseSearchQuery = (query) => {
    let text = query
    let tags = []
    let pinned = false
    let hasImage = false
    let inContent = false
    let modified = null
    let created = null

    text = text.replace(PINNED_QUALIFIER_REGEX, () => {
        pinned = true
        return ''
    })

    text = text.replace(IMAGE_QUALIFIER_REGEX, () => {
        hasImage = true
        return ''
    })

    text = text.replace(CONTENT_QUALIFIER_REGEX, () => {
        inContent = true
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

    return { text: text.trim().toLowerCase(), tags, pinned, hasImage, inContent, modified, created }
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

const toggleQualifier = (query, regex, qualifier) => {
    if (regex.test(query)) return query.replace(regex, '').trim()
    return query ? `${query} ${qualifier}` : qualifier
}

export const togglePinnedQualifier = (query) => toggleQualifier(query, PINNED_QUALIFIER_REGEX, PINNED_QUALIFIER)

export const toggleImageQualifier = (query) => toggleQualifier(query, IMAGE_QUALIFIER_REGEX, IMAGE_QUALIFIER)

export const toggleContentQualifier = (query) => toggleQualifier(query, CONTENT_QUALIFIER_REGEX, CONTENT_QUALIFIER)

export const filterNotes = (notes, query, { tags, pinned }) => {
    const parsed = parseSearchQuery(query)
    const tagIds = parsed.tags
        .map((name) => tags.find((t) => t.name.toLowerCase() === name)?.id)
        .filter(Boolean)

    const scored = notes.flatMap((note) => {
        if (parsed.pinned && !pinned.has(note.id)) return []
        if (tagIds.length > 0 && !tagIds.some((id) => note.tags?.includes(id))) return []
        if (parsed.hasImage && !MARKDOWN_IMAGE_REGEX.test(note.note || '')) return []
        if (parsed.modified && toDateKey(note.updatedAt) !== parsed.modified) return []
        if (parsed.created && toDateKey(note.createdAt) !== parsed.created) return []

        if (!parsed.text) return [{ note, score: 0 }]

        const titleMatch = fuzzyMatch(parsed.text, note.title)
        const matchesContent = parsed.inContent && (note.note || '').toLowerCase().includes(parsed.text)
        if (!titleMatch.matches && !matchesContent) return []

        return [{ note, score: titleMatch.score }]
    })

    if (!parsed.text) return scored.map(({ note }) => note)

    return scored.sort((a, b) => b.score - a.score).map(({ note }) => note)
}
