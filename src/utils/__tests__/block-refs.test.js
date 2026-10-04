import { extractBlock, findBlocks } from '../block-refs'

describe('find blocks', () => {
    test('finds a paragraph that ends with an id', () => {
        const blocks = findBlocks('Intro\n\nKey idea ^idea-1\n\nOutro')

        expect(blocks).toHaveLength(1)
        expect(blocks[0].id).toBe('idea-1')
        expect(blocks[0].text).toBe('Key idea')
    })

    test('reports the position of the id marker', () => {
        const text = 'Key idea ^idea-1'
        const [block] = findBlocks(text)

        expect(text.slice(block.idFrom, block.idTo)).toBe('^idea-1')
    })

    test('uses the whole paragraph when the id is on its last line', () => {
        const [block] = findBlocks('first line\nsecond line ^multi')

        expect(block.text).toBe('first line\nsecond line')
    })

    test('ignores an id in the middle of a paragraph', () => {
        expect(findBlocks('first ^mid\nsecond line')).toEqual([])
    })

    test('attaches a standalone id to the paragraph above it', () => {
        const [block] = findBlocks('A quote\nspread over lines\n^quote')

        expect(block.id).toBe('quote')
        expect(block.text).toBe('A quote\nspread over lines')
    })

    test('attaches a standalone id after a blank line to the previous block', () => {
        const [block] = findBlocks('| a | b |\n| - | - |\n| 1 | 2 |\n\n^table')

        expect(block.id).toBe('table')
        expect(block.text).toBe('| a | b |\n| - | - |\n| 1 | 2 |')
    })

    test('scopes a list item id to that item and its children', () => {
        const blocks = findBlocks('- one\n- two ^second\n    - child\n- three')

        expect(blocks).toHaveLength(1)
        expect(blocks[0].text).toBe('- two\n    - child')
    })

    test('ignores ids inside fenced code blocks', () => {
        expect(findBlocks('```\ncode ^hidden\n```')).toEqual([])
    })

    test('ignores ids that contain invalid characters', () => {
        expect(findBlocks('text ^no_good')).toEqual([])
    })
})

describe('extract block', () => {
    test('returns the block text without its id', () => {
        expect(extractBlock('Intro\n\nKey idea ^idea-1', 'idea-1')).toBe('Key idea')
    })

    test('returns null when the id does not exist', () => {
        expect(extractBlock('Intro ^a', 'b')).toBeNull()
    })
})
