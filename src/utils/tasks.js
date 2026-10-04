import MarkdownIt from 'markdown-it'

import { COMMENT_MARKER, COMMENT_OR_CODE_PATTERN } from '@/constants/extra-marks'
import {
    CUSTOM_TASK_LINE_PATTERN,
    CUSTOM_TASK_MARKER_LENGTH,
    NON_NEWLINE_PATTERN,
    TASK_CHECKED_MARK,
    TASK_CONTENT_PATTERN,
    TASK_LINE_PATTERN,
    TASK_UNCHECKED_MARK
} from '@/constants/tasks'

const md = new MarkdownIt({ html: true })

const maskComments = (source) => source.replace(
    COMMENT_OR_CODE_PATTERN,
    (match) => (match.startsWith(COMMENT_MARKER) ? match.replace(NON_NEWLINE_PATTERN, ' ') : match)
)

const findTaskLines = (source) => {
    const tokens = md.parse(maskComments(source), {})

    return tokens.flatMap((token, index) => (
        token.type === 'list_item_open'
        && tokens[index + 1]?.type === 'paragraph_open'
        && TASK_CONTENT_PATTERN.test(tokens[index + 2]?.content ?? '')
            ? [token.map[0]]
            : []
    ))
}

export const toggleTask = (source, index) => {
    const line = findTaskLines(source)[index]
    if (line === undefined) return source

    const lines = source.split('\n')

    lines[line] = lines[line].replace(
        TASK_LINE_PATTERN,
        (match, head, mark, tail) => (
            `${head}${mark === TASK_UNCHECKED_MARK ? TASK_CHECKED_MARK : TASK_UNCHECKED_MARK}${tail}`
        )
    )

    return lines.join('\n')
}

export const findCustomTaskRanges = (text) => Array.from(
    text.matchAll(CUSTOM_TASK_LINE_PATTERN),
    (match) => {
        const from = match.index + match[1].length

        return { from, to: from + CUSTOM_TASK_MARKER_LENGTH, status: match[2] }
    }
)
