import { CODE_SEGMENT_PATTERN } from '@/constants/code-segments'

export const mapOutsideCode = (text, transform) => {
    let cursor = 0
    let result = ''

    for (const match of text.matchAll(CODE_SEGMENT_PATTERN)) {
        result += transform(text.slice(cursor, match.index)) + match[0]
        cursor = match.index + match[0].length
    }

    return result + transform(text.slice(cursor))
}
