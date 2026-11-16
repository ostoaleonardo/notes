import { CHAR } from '@/constants/note-syntax'

export const isLineBoundary = (code) => (
    code === -1 || Number.isNaN(code) || code === CHAR.NEWLINE || code === CHAR.SPACE || code === CHAR.TAB
)

export const findLineEnd = (cx, from) => {
    let position = from

    while (position < cx.end && cx.char(position) !== CHAR.NEWLINE) position++

    return position
}
