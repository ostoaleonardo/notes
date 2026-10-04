import {
    BLOCK_ANCHOR_PREFIX,
    BLOCK_ID_ALPHABET,
    BLOCK_ID_LENGTH,
    BLOCK_ID_STANDALONE_PATTERN,
    BLOCK_ID_TRAILING_PATTERN,
    BLOCK_NON_TARGET_PATTERN,
    BLOCK_PREVIEW_MAX_LENGTH,
    LIST_ITEM_PATTERN
} from '@/constants/block-refs'
import { CODE_SEGMENT_PATTERN } from '@/constants/code-segments'

const getIndent = (line) => line.match(/^\s*/)[0].length

const stripTrailingId = (line) => line.replace(BLOCK_ID_TRAILING_PATTERN, '')

const toLines = (text) => {
    let offset = 0

    return text.split('\n').map((value) => {
        const line = { text: value, start: offset }
        offset += value.length + 1
        return line
    })
}

const isInside = (ranges, position) => ranges.some(([from, to]) => position >= from && position < to)

const groupLines = (text) => {
    const codeRanges = [...text.matchAll(CODE_SEGMENT_PATTERN)].map((match) => [
        match.index,
        match.index + match[0].length
    ])
    const groups = []
    let current = null

    for (const line of toLines(text)) {
        if (!line.text.trim() || isInside(codeRanges, line.start)) {
            current = null
            continue
        }

        if (!current) {
            current = []
            groups.push(current)
        }

        current.push(line)
    }

    return groups
}

const joinLines = (lines) => lines.map((line) => line.text).join('\n')

const buildBlock = (id, lines, idLine) => {
    const match = BLOCK_ID_TRAILING_PATTERN.exec(idLine.text)
    const idFrom = idLine.start + match.index + match[1].length

    return { id, text: joinLines(lines), idFrom, idTo: idFrom + id.length + 1 }
}

const findListItemBlock = (group, index) => {
    const line = group[index]
    const indent = getIndent(line.text)
    const children = []

    for (const next of group.slice(index + 1)) {
        if (getIndent(next.text) <= indent) break
        children.push(next)
    }

    return [{ ...line, text: stripTrailingId(line.text) }, ...children]
}

const findGroupBlocks = (group, previousGroup) => {
    const blocks = []

    group.forEach((line, index) => {
        const standalone = BLOCK_ID_STANDALONE_PATTERN.exec(line.text.trim())

        if (standalone) {
            const target = index > 0 ? group.slice(0, index) : previousGroup
            if (target) blocks.push(buildBlock(standalone[1], target, line))
            return
        }

        const trailing = BLOCK_ID_TRAILING_PATTERN.exec(line.text)
        if (!trailing) return

        if (LIST_ITEM_PATTERN.test(line.text)) {
            blocks.push(buildBlock(trailing[2], findListItemBlock(group, index), line))
            return
        }

        if (index === group.length - 1) {
            const lines = [...group.slice(0, index), { ...line, text: stripTrailingId(line.text) }]
            blocks.push(buildBlock(trailing[2], lines, line))
        }
    })

    return blocks
}

export const findBlocks = (text) => {
    const groups = groupLines(text || '')

    return groups.flatMap((group, index) => findGroupBlocks(group, groups[index - 1]))
}

export const extractBlock = (text, id) => findBlocks(text).find((block) => block.id === id)?.text ?? null

export const getBlockPreview = (text) => text.split('\n')[0].trim().slice(0, BLOCK_PREVIEW_MAX_LENGTH)

const findGroupUnlabeledBlocks = (group) => {
    const blocks = []

    group.forEach((line, index) => {
        const trimmed = line.text.trim()
        if (BLOCK_ID_STANDALONE_PATTERN.test(trimmed) || BLOCK_ID_TRAILING_PATTERN.test(line.text)) return

        const insertAt = line.start + line.text.trimEnd().length

        if (LIST_ITEM_PATTERN.test(line.text)) {
            blocks.push({ text: joinLines(findListItemBlock(group, index)), insertAt })
        } else if (index === group.length - 1 && !BLOCK_NON_TARGET_PATTERN.test(trimmed)) {
            blocks.push({ text: joinLines(group), insertAt })
        }
    })

    return blocks
}

export const findUnlabeledBlocks = (text) => groupLines(text || '').flatMap(findGroupUnlabeledBlocks)

export const addBlockId = (text, { index, preview }, id) => {
    const block = findUnlabeledBlocks(text)[index]
    if (!block || getBlockPreview(block.text) !== preview) return null

    return `${text.slice(0, block.insertAt)} ${BLOCK_ANCHOR_PREFIX}${id}${text.slice(block.insertAt)}`
}

export const generateBlockId = (takenIds = []) => {
    let id

    do {
        id = Array.from(
            { length: BLOCK_ID_LENGTH },
            () => BLOCK_ID_ALPHABET[Math.floor(Math.random() * BLOCK_ID_ALPHABET.length)]
        ).join('')
    } while (takenIds.includes(id))

    return id
}
