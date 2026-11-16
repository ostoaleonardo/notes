import {
    FIRST_CHUNK_LINES,
    MIN_BLOCK_LINES,
    NEXT_CHUNK_LINES,
    SINGLE_CHUNK_MAX_LINES
} from './constants/read-chunks'

const getBlockLines = (token) => (token.map ? Math.max(token.map[1] - token.map[0], MIN_BLOCK_LINES) : MIN_BLOCK_LINES)

export const splitBlocks = (tokens) => {
    const blocks = []
    let depth = 0
    let start = 0

    tokens.forEach((token, index) => {
        depth += token.nesting

        if (depth === 0) {
            blocks.push({ from: start, to: index + 1, lines: getBlockLines(tokens[start]) })
            start = index + 1
        }
    })

    return blocks
}

export const groupChunks = (tokens) => {
    const blocks = splitBlocks(tokens)
    const totalLines = blocks.reduce((sum, block) => sum + block.lines, 0)

    if (totalLines <= SINGLE_CHUNK_MAX_LINES) return [{ from: 0, to: tokens.length }]

    const chunks = []
    let from = 0
    let lines = 0

    blocks.forEach((block) => {
        lines += block.lines

        const target = chunks.length === 0 ? FIRST_CHUNK_LINES : NEXT_CHUNK_LINES

        if (lines >= target) {
            chunks.push({ from, to: block.to })
            from = block.to
            lines = 0
        }
    })

    if (from < tokens.length) chunks.push({ from, to: tokens.length })

    return chunks
}
