import { buildRepositoryTree } from '../drawer-tree'
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
