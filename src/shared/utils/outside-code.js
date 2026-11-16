import {
    CODE_SEGMENT_CACHE_MAX_LENGTH,
    CODE_SEGMENT_CACHE_MIN_LENGTH,
    CODE_SEGMENT_CACHE_SIZE,
    CODE_SEGMENT_PATTERN
} from '@/shared/constants/code-segments'

const segmentsByText = new Map()

const isCacheable = (text) => (
    text.length >= CODE_SEGMENT_CACHE_MIN_LENGTH && text.length <= CODE_SEGMENT_CACHE_MAX_LENGTH
)

const findCodeSegments = (text) => {
    if (!isCacheable(text)) return [...text.matchAll(CODE_SEGMENT_PATTERN)]
    if (segmentsByText.has(text)) return segmentsByText.get(text)

    const segments = [...text.matchAll(CODE_SEGMENT_PATTERN)]
    if (segmentsByText.size >= CODE_SEGMENT_CACHE_SIZE) segmentsByText.clear()
    segmentsByText.set(text, segments)

    return segments
}

export const mapOutsideCode = (text, transform) => {
    let cursor = 0
    let result = ''

    for (const match of findCodeSegments(text)) {
        result += transform(text.slice(cursor, match.index)) + match[0]
        cursor = match.index + match[0].length
    }

    return result + transform(text.slice(cursor))
}

export const getCodeRanges = (text) => findCodeSegments(text).map((match) => [
    match.index,
    match.index + match[0].length
])

export const isInsideRanges = (ranges, position) => (
    ranges.some(([from, to]) => position >= from && position < to)
)
