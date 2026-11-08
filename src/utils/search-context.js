import {
    SEARCH_NODE_TYPES,
    SEARCH_OPERATORS,
    SNIPPET_ELLIPSIS,
    SNIPPET_LEAD_LENGTH,
    SNIPPET_MAX_LENGTH,
    TASK_OPERATORS,
    UNIT_OPERATORS
} from '@/constants/search-query'

const SCOPED_OPERATORS = [
    SEARCH_OPERATORS.CONTENT,
    SEARCH_OPERATORS.MATCH_CASE,
    SEARCH_OPERATORS.IGNORE_CASE,
    ...UNIT_OPERATORS,
    ...TASK_OPERATORS
]

const collect = (node, highlights) => {
    if (node.type === SEARCH_NODE_TYPES.AND || node.type === SEARCH_NODE_TYPES.OR) {
        node.children.forEach((child) => collect(child, highlights))
    } else if (node.type === SEARCH_NODE_TYPES.TEXT && node.value) {
        highlights.texts.push(node.lower)
    } else if (node.type === SEARCH_NODE_TYPES.REGEX) {
        highlights.regexes.push(node.regexes.insensitive)
    } else if (
        node.type === SEARCH_NODE_TYPES.FILTER
        && node.argument
        && SCOPED_OPERATORS.includes(node.name)
    ) {
        collect(node.argument, highlights)
    }

    return highlights
}

export const collectHighlights = (ast) => collect(ast, { texts: [], regexes: [] })

const hasHighlights = ({ texts, regexes }) => texts.length > 0 || regexes.length > 0

const findRanges = (line, { texts, regexes }) => {
    const lower = line.toLowerCase()
    const ranges = []

    texts.forEach((text) => {
        for (let index = lower.indexOf(text); index !== -1; index = lower.indexOf(text, index + text.length)) {
            ranges.push([index, index + text.length])
        }
    })

    regexes.forEach((regex) => {
        const global = new RegExp(regex.source, 'gi')

        for (const match of line.matchAll(global)) {
            if (match[0]) ranges.push([match.index, match.index + match[0].length])
        }
    })

    return ranges.sort((a, b) => a[0] - b[0])
}

const mergeRanges = (ranges) => ranges.reduce((merged, range) => {
    const last = merged[merged.length - 1]

    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])

    return merged
}, [])

const clip = (line, ranges) => {
    const trimmed = line.trim()
    const offset = line.indexOf(trimmed)
    const shifted = ranges.map(([start, end]) => [start - offset, end - offset])

    if (trimmed.length <= SNIPPET_MAX_LENGTH) return { text: trimmed, ranges: shifted }

    const first = shifted[0][0]
    const from = Math.max(0, first - SNIPPET_LEAD_LENGTH)
    const to = Math.min(trimmed.length, from + SNIPPET_MAX_LENGTH)
    const prefix = from > 0 ? SNIPPET_ELLIPSIS : ''
    const suffix = to < trimmed.length ? SNIPPET_ELLIPSIS : ''
    const moved = shifted
        .filter(([start, end]) => start >= from && end <= to)
        .map(([start, end]) => [start - from + prefix.length, end - from + prefix.length])

    return { text: `${prefix}${trimmed.slice(from, to)}${suffix}`, ranges: moved }
}

export const getSnippets = (content, highlights, limit) => {
    if (!hasHighlights(highlights)) return []

    const snippets = []

    for (const line of content.split('\n')) {
        if (snippets.length >= limit) break

        const ranges = mergeRanges(findRanges(line, highlights))
        if (ranges.length > 0 && line.trim()) snippets.push(clip(line, ranges))
    }

    return snippets
}

export const splitByRanges = (text, ranges) => {
    const parts = []
    let cursor = 0

    ranges.forEach(([start, end]) => {
        if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false })
        parts.push({ text: text.slice(start, end), match: true })
        cursor = end
    })

    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })

    return parts
}
