import { getFolderPath } from '../repository-path'

describe('repository path', () => {
    test('reads the path after the document segment', () => {
        const uri = 'content://x/tree/primary%3ANotes/document/primary%3ANotes%2FWork'

        expect(getFolderPath(uri)).toBe('Notes/Work')
    })

    test('reads the path after the tree segment', () => {
        expect(getFolderPath('content://x/tree/primary%3ANotes')).toBe('Notes')
    })

    test('returns the decoded value when there is no marker', () => {
        expect(getFolderPath('notes')).toBe('notes')
    })

    test('returns the original value when decoding fails', () => {
        expect(getFolderPath('%E0%A4%A')).toBe('%E0%A4%A')
    })
})
