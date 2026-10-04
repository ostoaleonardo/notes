import {
    addBlockId,
    extractBlock,
    findBlocks,
    findUnlabeledBlocks,
    generateBlockId
} from '../block-refs'

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

describe('find unlabeled blocks', () => {
    test('finds paragraphs and list items that have no id', () => {
        const blocks = findUnlabeledBlocks('Intro\nline two\n\n- one\n- two')

        expect(blocks.map(({ text }) => text)).toEqual(['Intro\nline two', '- one', '- two'])
    })

    test('skips blocks that already have an id', () => {
        expect(findUnlabeledBlocks('Done ^a\n\n- one ^b\n- two')).toHaveLength(1)
    })

    test('skips headings, tables, rules and fenced code', () => {
        const text = '# Title\n\n| a | b |\n| - | - |\n\n---\n\n```\ncode\n```'

        expect(findUnlabeledBlocks(text)).toEqual([])
    })

    test('reports where the id goes, before trailing whitespace', () => {
        const [block] = findUnlabeledBlocks('Intro   ')

        expect(block.insertAt).toBe(5)
    })
})

describe('add block id', () => {
    test('appends the id to the chosen paragraph', () => {
        const text = 'First\n\nSecond'

        expect(addBlockId(text, { index: 1, preview: 'Second' }, 'abc123')).toBe('First\n\nSecond ^abc123')
    })

    test('appends the id to the chosen list item', () => {
        const text = '- one\n- two\n- three'

        expect(addBlockId(text, { index: 1, preview: '- two' }, 'x1')).toBe('- one\n- two ^x1\n- three')
    })

    test('makes the new block discoverable by its id', () => {
        const text = addBlockId('Intro\n\nKey idea', { index: 1, preview: 'Key idea' }, 'abc123')

        expect(extractBlock(text, 'abc123')).toBe('Key idea')
    })

    test('refuses to write when the block moved or changed', () => {
        expect(addBlockId('First\n\nSecond', { index: 1, preview: 'Other' }, 'x1')).toBeNull()
        expect(addBlockId('First', { index: 4, preview: 'First' }, 'x1')).toBeNull()
    })
})

describe('generate block id', () => {
    test('produces a valid id', () => {
        expect(generateBlockId()).toMatch(/^[a-z0-9]{6}$/)
    })

    test('never repeats a taken id', () => {
        const random = jest.spyOn(Math, 'random')
        random.mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValueOnce(0)
        random.mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValueOnce(0)

        expect(generateBlockId(['aaaaaa'])).not.toBe('aaaaaa')

        random.mockRestore()
    })
})
