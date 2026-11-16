import { CHAR, MATH_DELIMITER_LENGTH, NOTE_NODES, WORD_CHAR_PATTERN } from '@/constants/note-syntax'

const isWordChar = (code) => !Number.isNaN(code) && code > 0 && WORD_CHAR_PATTERN.test(String.fromCharCode(code))

const isSpace = (code) => (
    code === CHAR.SPACE || code === CHAR.TAB || code === CHAR.NEWLINE || code === -1 || Number.isNaN(code)
)

const findDollar = (cx, from, stopAtNewline) => {
    for (let position = from; position < cx.end; position++) {
        const code = cx.char(position)

        if (code === CHAR.DOLLAR) return position
        if (stopAtNewline && code === CHAR.NEWLINE) return -1
    }

    return -1
}

const parseBlockMath = (cx, pos) => {
    const contentFrom = pos + MATH_DELIMITER_LENGTH
    const closeFrom = findDollar(cx, contentFrom, false)

    if (closeFrom <= contentFrom || cx.char(closeFrom + 1) !== CHAR.DOLLAR) return -1

    return cx.append(cx.elt(NOTE_NODES.BLOCK_MATH, pos, closeFrom + MATH_DELIMITER_LENGTH))
}

const parseInlineMath = (cx, pos) => {
    if (isWordChar(cx.char(pos - 1)) || isSpace(cx.char(pos + 1)) || cx.char(pos + 1) === CHAR.DOLLAR) return -1

    const closeFrom = findDollar(cx, pos + 1, true)

    if (closeFrom === -1 || isSpace(cx.char(closeFrom - 1)) || isWordChar(cx.char(closeFrom + 1))) return -1

    return cx.append(cx.elt(NOTE_NODES.INLINE_MATH, pos, closeFrom + 1))
}

const parseMath = (cx, next, pos) => {
    if (next !== CHAR.DOLLAR) return -1

    return cx.char(pos + 1) === CHAR.DOLLAR ? parseBlockMath(cx, pos) : parseInlineMath(cx, pos)
}

export const math = {
    defineNodes: [NOTE_NODES.INLINE_MATH, NOTE_NODES.BLOCK_MATH],
    parseInline: [{ name: NOTE_NODES.INLINE_MATH, parse: parseMath, before: 'Emphasis' }]
}
