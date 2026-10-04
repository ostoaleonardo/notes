import { getFrontmatterAutoClose, isFrontmatterFenceCompletion } from '../markdown-dom-frontmatter'

describe('frontmatter auto close', () => {
    test('closes the block when the third dash is typed on the first line', () => {
        const result = getFrontmatterAutoClose('--', 2, 2, '-')

        expect(result).toEqual({
            changes: { from: 2, insert: '-\n\n---' },
            selection: { anchor: 4 }
        })
    })

    test('closes the block above existing note content', () => {
        const result = getFrontmatterAutoClose('--\nHello', 2, 2, '-')

        expect(result.changes.insert).toBe('-\n\n---')
    })

    test('ignores dashes typed outside the first line', () => {
        expect(getFrontmatterAutoClose('Title\n--', 8, 8, '-')).toBeNull()
    })

    test('ignores the second dash', () => {
        expect(getFrontmatterAutoClose('-', 1, 1, '-')).toBeNull()
    })

    test('ignores other characters', () => {
        expect(getFrontmatterAutoClose('--', 2, 2, 'a')).toBeNull()
    })

    test('ignores typing over a selection', () => {
        expect(getFrontmatterAutoClose('--', 0, 2, '-')).toBeNull()
    })

    test('does not duplicate an existing closing fence', () => {
        const doc = '--\ntags: [a]\n---\nBody'

        expect(getFrontmatterAutoClose(doc, 2, 2, '-')).toBeNull()
    })
})

describe('frontmatter fence completion', () => {
    test('detects the third dash typed at the end of the first line', () => {
        expect(isFrontmatterFenceCompletion('--', 2, 2, '-')).toBe(true)
    })

    test('detects it even when a closing fence already exists below', () => {
        expect(isFrontmatterFenceCompletion('--\n---', 2, 2, '-')).toBe(true)
    })

    test('ignores a first line that is not two dashes', () => {
        expect(isFrontmatterFenceCompletion('-a', 2, 2, '-')).toBe(false)
    })

    test('ignores dashes typed on later lines', () => {
        expect(isFrontmatterFenceCompletion('Title\n--', 8, 8, '-')).toBe(false)
    })
})
