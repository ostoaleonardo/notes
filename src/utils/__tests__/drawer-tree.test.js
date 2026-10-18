import {
    buildLevelRows,
    buildRepositoryTree,
    findFolderNode,
    resolveLevel
} from '../drawer-tree'
import { NOTE_SORTS } from '@/constants/note-sort'
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

    test('applies the given sort to notes within a folder', () => {
        const tree = buildRepositoryTree(
            MOCK_REPOSITORY_LIST,
            MOCK_NOTES_BY_REPOSITORY,
            NOTE_SORTS.NAME_DESC
        )

        expect(tree[0].notes.map((note) => note.title)).toEqual(['Zebra', 'Apple'])
    })

    test('returns an empty notes list for folders without notes', () => {
        const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree[0].subfolders[0].notes).toEqual([])
    })
})

describe('find a folder node', () => {
    const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

    test('finds the root folder', () => {
        expect(findFolderNode(tree, 'root').repository.id).toBe('root')
    })

    test('finds a deeply nested folder', () => {
        expect(findFolderNode(tree, 'grandchild').repository.id).toBe('grandchild')
    })

    test('returns nothing for an unknown folder', () => {
        expect(findFolderNode(tree, 'missing')).toBeNull()
    })
})

describe('resolve the level to show', () => {
    const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

    test('returns the requested folder', () => {
        expect(resolveLevel(tree, 'child-a').repository.id).toBe('child-a')
    })

    test('falls back to the root when the folder no longer exists', () => {
        expect(resolveLevel(tree, 'deleted').repository.id).toBe('root')
    })

    test('falls back to the root when no folder is selected', () => {
        expect(resolveLevel(tree, null).repository.id).toBe('root')
    })

    test('returns nothing when there are no repositories', () => {
        expect(resolveLevel([], 'root')).toBeNull()
    })
})

describe('build the rows of one level', () => {
    const tree = buildRepositoryTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

    test('lists the header, then the subfolders, then the notes', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'root'))

        expect(rows.map((row) => row.id)).toEqual([
            'level:root',
            'repository:child-b',
            'repository:child-a',
            'note:note-apple',
            'note:note-zebra'
        ])
    })

    test('flags the header of the root folder', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'root'))

        expect(rows[0].isRoot).toBe(true)
    })

    test('does not flag the header of a nested folder as root', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'child-a'))

        expect(rows[0].isRoot).toBe(false)
    })

    test('only includes the direct children of the folder', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'child-a'))

        expect(rows.map((row) => row.id)).toEqual(['level:child-a', 'repository:grandchild'])
    })

    test('shows only the header for an empty folder', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'child-b'))

        expect(rows.map((row) => row.id)).toEqual(['level:child-b'])
    })
})
