import { isLineBoundary } from './lines'

import { isValidTagName } from '@/shared/utils/tag-names'

import { CHAR, NOTE_NODES, TAG_STOP_PATTERN, TRAILING_SLASH } from '@/shared/constants/note-syntax'

const parseTag = (cx, next, pos) => {
    if (next !== CHAR.HASH || !isLineBoundary(cx.char(pos - 1))) return -1

    let end = pos + 1

    while (end < cx.end && !TAG_STOP_PATTERN.test(String.fromCharCode(cx.char(end)))) end++

    let nameEnd = end
    while (nameEnd > pos + 1 && cx.slice(nameEnd - 1, nameEnd) === TRAILING_SLASH) nameEnd--

    if (nameEnd === pos + 1 || !isValidTagName(cx.slice(pos + 1, nameEnd))) return -1

    return cx.append(cx.elt(NOTE_NODES.TAG, pos, nameEnd))
}

export const inlineTag = {
    defineNodes: [NOTE_NODES.TAG],
    parseInline: [{ name: NOTE_NODES.TAG, parse: parseTag }]
}
