import { groupChunks, splitBlocks } from '../read-chunks'
import { parseNoteMarkdown, renderReadHtml, createReadRenderer } from '../../shared/markdown-dom-render-html'

import { FIRST_CHUNK_LINES, SINGLE_CHUNK_MAX_LINES } from '../constants/read-chunks'

const buildNote = (paragraphs) => Array.from({ length: paragraphs }, (_, index) => `Paragraph ${index} with **bold** text.`).join('\n\n')

const readerOf = (text) => createReadRenderer(parseNoteMarkdown(text))

const renderChunks = (text) => {
    const reader = readerOf(text)

    return Array.from({ length: reader.count }, (_, index) => reader.render(index))
}

describe('split blocks', () => {
    test('treats each top level block as one unit', () => {
        const { tokens } = parseNoteMarkdown('# Title\n\n- a\n- b\n\n```js\ncode\n```\n\n---')
        const blocks = splitBlocks(tokens)

        expect(blocks).toHaveLength(4)
        expect(blocks.at(-1).to).toBe(tokens.length)
    })

    test('keeps nested lists and quotes inside their block', () => {
        const { tokens } = parseNoteMarkdown('- a\n  - b\n    - c\n\n> quote\n> > nested')

        expect(splitBlocks(tokens)).toHaveLength(2)
    })

    test('covers every token exactly once', () => {
        const { tokens } = parseNoteMarkdown(buildNote(40))
        const blocks = splitBlocks(tokens)

        expect(blocks[0].from).toBe(0)
        blocks.slice(1).forEach((block, index) => expect(block.from).toBe(blocks[index].to))
    })
})

describe('group chunks', () => {
    test('keeps a short note in a single chunk', () => {
        const { tokens } = parseNoteMarkdown(buildNote(SINGLE_CHUNK_MAX_LINES / 4))

        expect(groupChunks(tokens)).toHaveLength(1)
    })

    test('splits a long note into several chunks', () => {
        const { tokens } = parseNoteMarkdown(buildNote(400))

        expect(groupChunks(tokens).length).toBeGreaterThan(2)
    })

    test('makes the first chunk smaller than the next ones', () => {
        const { tokens } = parseNoteMarkdown(buildNote(400))
        const [first, second] = groupChunks(tokens)

        expect(first.to - first.from).toBeLessThan(second.to - second.from)
    })

    test('never splits a block across chunks', () => {
        const { tokens } = parseNoteMarkdown(`${buildNote(100)}\n\n${'- item\n'.repeat(300)}\n\n${buildNote(100)}`)
        const boundaries = new Set(splitBlocks(tokens).map((block) => block.to))

        groupChunks(tokens).forEach((chunk) => expect(boundaries.has(chunk.to)).toBe(true))
    })

    test('covers every token exactly once', () => {
        const { tokens } = parseNoteMarkdown(buildNote(400))
        const chunks = groupChunks(tokens)

        expect(chunks[0].from).toBe(0)
        expect(chunks.at(-1).to).toBe(tokens.length)
        chunks.slice(1).forEach((chunk, index) => expect(chunk.from).toBe(chunks[index].to))
    })

    test('uses the first chunk target for the first chunk', () => {
        const { tokens } = parseNoteMarkdown(buildNote(400))
        const [first] = groupChunks(tokens)
        const firstBlocks = splitBlocks(tokens).filter((block) => block.to <= first.to)

        expect(firstBlocks.length).toBeGreaterThanOrEqual(FIRST_CHUNK_LINES / 4)
    })
})

describe('chunked render', () => {
    test('joined chunks equal the full render of a long note', () => {
        const text = `# Title\n\n${buildNote(400)}\n\n- [ ] task\n\n| a | b |\n| - | - |\n| 1 | 2 |`
        const chunks = renderChunks(text)

        expect(chunks.length).toBeGreaterThan(1)
        expect(chunks.join('')).toBe(renderReadHtml(parseNoteMarkdown(text)))
    })

    test('keeps footnotes in the last chunk', () => {
        const text = `Intro[^1]\n\n${buildNote(400)}\n\n[^1]: The note.`
        const chunks = renderChunks(text)

        expect(chunks.at(-1)).toContain('footnote')
        expect(chunks[0]).toContain('footnote-ref')
    })

    test('renders nothing for a missing note', () => {
        expect(createReadRenderer(null).count).toBe(0)
    })
})
