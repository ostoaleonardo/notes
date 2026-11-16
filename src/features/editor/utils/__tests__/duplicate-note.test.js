import { buildDuplicateNote } from '../duplicate-note'

describe('build duplicate note', () => {
    test('copies the note content and tags, keeping the original repository', () => {
        const note = {
            path: 'repo-1::Groceries.md',
            filename: 'Groceries.md',
            title: 'Groceries',
            note: 'Milk, eggs',
            tags: ['tag-1'],
            repositoryId: 'repo-1',
            createdAt: 1700000000000,
            updatedAt: 1700000100000
        }

        const result = buildDuplicateNote(note, {
            createdAt: 1700000200000,
            copySuffix: '(copy)'
        })

        expect(result).toEqual({
            path: 'repo-1::Groceries.md',
            filename: 'Groceries.md',
            title: 'Groceries (copy)',
            note: 'Milk, eggs',
            tags: ['tag-1'],
            repositoryId: 'repo-1',
            createdAt: 1700000200000,
            updatedAt: ''
        })
    })

    test('does not mutate the original note', () => {
        const note = { path: 'repo-1::Groceries.md', title: 'Groceries', tags: [] }

        buildDuplicateNote(note, { createdAt: 1, copySuffix: '(copy)' })

        expect(note).toEqual({ path: 'repo-1::Groceries.md', title: 'Groceries', tags: [] })
    })
})
