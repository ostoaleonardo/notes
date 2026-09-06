import { buildRepositoryTree, flattenDrawerTree } from '../drawer-tree'
import { MOCK_NOTES_BY_REPOSITORY, MOCK_REPOSITORY_LIST } from '../__fixtures__/drawer-tree'

describe('build repository tree', () => {
    test('nests subfolders under their parent', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree).toHaveLength(1)
        expect(tree[0].repository.id).toBe('root')
        expect(tree[0].subfolders.map((node) => node.repository.id)).toEqual(['child-b', 'child-a'])
        expect(tree[0].subfolders[1].subfolders[0].repository.id).toBe('grandchild')
    })

    test('sorts notes within a folder by title', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree[0].notes.map((note) => note.title)).toEqual(['Apple', 'Zebra'])
    })

    test('returns an empty notes list for folders without notes', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree[0].subfolders[0].notes).toEqual([])
    })
})

describe('flatten drawer tree', () => {
    test('interleaves repository and note rows in tree order when nothing is collapsed', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)
        const rows = flattenDrawerTree(tree, new Set())

        expect(rows.map((row) => row.id)).toEqual([
            'repository:root',
            'note:note-apple',
            'note:note-zebra',
            'repository:child-b',
            'repository:child-a',
            'repository:grandchild',
            'note:note-nested'
        ])
    })

    test('assigns depth based on nesting level', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)
        const rows = flattenDrawerTree(tree, new Set())

        const grandchild = rows.find((row) => row.id === 'repository:grandchild')
        const nestedNote = rows.find((row) => row.id === 'note:note-nested')

        expect(grandchild.depth).toBe(2)
        expect(nestedNote.depth).toBe(3)
    })

    test('omits notes and subfolders of a collapsed folder', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)
        const rows = flattenDrawerTree(tree, new Set(['child-a']))

        expect(rows.map((row) => row.id)).toEqual([
            'repository:root',
            'note:note-apple',
            'note:note-zebra',
            'repository:child-b',
            'repository:child-a'
        ])
    })
})
