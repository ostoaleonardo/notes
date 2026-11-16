import { findLineEnd, isLineBoundary } from './lines'

import { BLOCK_ID_CHAR_PATTERN, CHAR, NOTE_NODES } from '@/constants/note-syntax'

const isTrailingSpace = (code) => code === CHAR.SPACE || code === CHAR.TAB

const parseBlockId = (cx, next, pos) => {
    if (next !== CHAR.CARET || !isLineBoundary(cx.char(pos - 1))) return -1

    let end = pos + 1

    while (end < cx.end && BLOCK_ID_CHAR_PATTERN.test(String.fromCharCode(cx.char(end)))) end++

    if (end === pos + 1) return -1

    const lineEnd = findLineEnd(cx, end)

    for (let index = end; index < lineEnd; index++) {
        if (!isTrailingSpace(cx.char(index))) return -1
    }

    return cx.append(cx.elt(NOTE_NODES.BLOCK_ID, pos, end))
}

export const blockId = {
    defineNodes: [NOTE_NODES.BLOCK_ID],
    parseInline: [{ name: NOTE_NODES.BLOCK_ID, parse: parseBlockId }]
}
