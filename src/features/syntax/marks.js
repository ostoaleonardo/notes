import { CHAR, COMMENT_MARK_LENGTH, HIGHLIGHT_MARK_LENGTH, NOTE_NODES } from '@/shared/constants/note-syntax'

const HIGHLIGHT_DELIMITER = { resolve: NOTE_NODES.HIGHLIGHT, mark: NOTE_NODES.HIGHLIGHT_MARK }

const isDouble = (cx, pos, code) => cx.char(pos) === code && cx.char(pos + 1) === code

const findDouble = (cx, from, code) => {
    for (let position = from; position < cx.end - 1; position++) {
        const current = cx.char(position)

        if (current === code && cx.char(position + 1) === code) return position
    }

    return -1
}

const buildPair = (cx, name, markName, from, closeFrom, length) => cx.append(cx.elt(
    name,
    from,
    closeFrom + length,
    [cx.elt(markName, from, from + length), cx.elt(markName, closeFrom, closeFrom + length)]
))

const isSpace = (code) => code === CHAR.SPACE || code === CHAR.TAB || code === CHAR.NEWLINE || code === -1 || Number.isNaN(code)

const parseHighlight = (cx, next, pos) => {
    if (next !== CHAR.EQUALS || cx.char(pos + 1) !== CHAR.EQUALS || cx.char(pos + 2) === CHAR.EQUALS) return -1
    if (cx.char(pos - 1) === CHAR.EQUALS) return -1

    const canOpen = !isSpace(cx.char(pos + HIGHLIGHT_MARK_LENGTH))
    const canClose = !isSpace(cx.char(pos - 1))

    return cx.addDelimiter(HIGHLIGHT_DELIMITER, pos, pos + HIGHLIGHT_MARK_LENGTH, canOpen, canClose)
}

const parseComment = (cx, next, pos) => {
    if (next !== CHAR.PERCENT || !isDouble(cx, pos, CHAR.PERCENT)) return -1

    const closeFrom = findDouble(cx, pos + COMMENT_MARK_LENGTH, CHAR.PERCENT)
    if (closeFrom === -1) return -1

    return buildPair(cx, NOTE_NODES.COMMENT, NOTE_NODES.COMMENT_MARK, pos, closeFrom, COMMENT_MARK_LENGTH)
}

export const highlight = {
    defineNodes: [NOTE_NODES.HIGHLIGHT, NOTE_NODES.HIGHLIGHT_MARK],
    parseInline: [{ name: NOTE_NODES.HIGHLIGHT, parse: parseHighlight, after: 'Emphasis' }]
}

export const comment = {
    defineNodes: [NOTE_NODES.COMMENT, NOTE_NODES.COMMENT_MARK],
    parseInline: [{ name: NOTE_NODES.COMMENT, parse: parseComment, before: 'Emphasis' }]
}
