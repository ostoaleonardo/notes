import { buildDuplicateNote } from '../duplicate-note'

describe('build duplicate note', () => {
    test('copies the note content and tags, keeping the original repository', () => {
        const note = {
            id: 'note-1',
            title: 'Groceries',
            note: 'Milk, eggs',
            tags: ['tag-1'],
            repositoryId: 'repo-1',
            createdAt: 1700000000000,
            updatedAt: 1700000100000
        }

        const result = buildDuplicateNote(note, {
            id: 'note-2',
            createdAt: 1700000200000,
            copySuffix: '(copy)'
        })

        expect(result).toEqual({
            id: 'note-2',
            title: 'Groceries (copy)',
            note: 'Milk, eggs',
            tags: ['tag-1'],
            repositoryId: 'repo-1',
            createdAt: 1700000200000,
            updatedAt: ''
        })
    })

    test('does not mutate the original note', () => {
        const note = { id: 'note-1', title: 'Groceries', tags: [] }

        buildDuplicateNote(note, { id: 'note-2', createdAt: 1, copySuffix: '(copy)' })

        expect(note).toEqual({ id: 'note-1', title: 'Groceries', tags: [] })
    })
})
