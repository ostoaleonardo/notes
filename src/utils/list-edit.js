import { LIST_INDENT, LIST_LINE_PATTERN } from '@/constants/markdown-patterns'

const ORDERED_PATTERN = /^\d+\.$/
const NEW_CHECKBOX = '[ ] '

export const getListEnterEdit = (text, offset) => {
    const match = text.match(LIST_LINE_PATTERN)
    if (!match) return null

    const [full, indent, marker, spacing, checkbox] = match
    if (offset < full.length) return null

    if (text.slice(full.length).trim() === '') {
        const outdent = Math.min(indent.length, LIST_INDENT.length)
        const insert = outdent > 0 ? text.slice(outdent) : ''

        return { from: 0, to: text.length, insert, cursor: insert.length }
    }

    const nextMarker = ORDERED_PATTERN.test(marker) ? `${parseInt(marker, 10) + 1}.` : marker
    const insert = `\n${indent}${nextMarker}${spacing}${checkbox ? NEW_CHECKBOX : ''}`

    return { from: offset, to: offset, insert, cursor: offset + insert.length }
}

export const getListBackspaceEdit = (text, offset) => {
    const match = text.match(LIST_LINE_PATTERN)
    if (!match || offset !== match[0].length) return null

    const indentLength = match[1].length

    return { from: indentLength, to: offset, insert: '', cursor: indentLength }
}
