import {
    buildLevelRows,
    buildFolderTree,
    findFolderNode,
    resolveLevel
} from '../drawer-tree'
import * as noteSort from '@/shared/utils/note-sort'
import { NOTE_SORTS } from '@/shared/constants/note-sort'
import { MOCK_NOTES_BY_REPOSITORY, MOCK_REPOSITORY_LIST } from '../__fixtures__/drawer-tree'

describe('build folder tree', () => {
    test('nests subfolders under their parent', () => {
        const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree).toHaveLength(1)
        expect(tree[0].folder.id).toBe('root')
        expect(tree[0].subfolders.map((node) => node.folder.id)).toEqual(['child-b', 'child-a'])
        expect(tree[0].subfolders[1].subfolders[0].folder.id).toBe('grandchild')
    })

    test('sorts notes within a folder by title', () => {
        const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree[0].notes.map((note) => note.title)).toEqual(['Apple', 'Zebra'])
    })

    test('applies the given sort to notes within a folder', () => {
        const tree = buildFolderTree(
            MOCK_REPOSITORY_LIST,
            MOCK_NOTES_BY_REPOSITORY,
            NOTE_SORTS.NAME_DESC
        )

        expect(tree[0].notes.map((note) => note.title)).toEqual(['Zebra', 'Apple'])
    })

    test('returns an empty notes list for folders without notes', () => {
        const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(tree[0].subfolders[0].notes).toEqual([])
    })
})

describe('find a folder node', () => {
    const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

    test('finds the root folder', () => {
        expect(findFolderNode(tree, 'root').folder.id).toBe('root')
    })

    test('finds a deeply nested folder', () => {
        expect(findFolderNode(tree, 'grandchild').folder.id).toBe('grandchild')
    })

    test('returns nothing for an unknown folder', () => {
        expect(findFolderNode(tree, 'missing')).toBeNull()
    })
})

describe('resolve the level to show', () => {
    const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

    test('returns the requested folder', () => {
        expect(resolveLevel(tree, 'child-a').folder.id).toBe('child-a')
    })

    test('falls back to the root when the folder no longer exists', () => {
        expect(resolveLevel(tree, 'deleted').folder.id).toBe('root')
    })

    test('falls back to the root when no folder is selected', () => {
        expect(resolveLevel(tree, null).folder.id).toBe('root')
    })

    test('returns nothing when there are no repositories', () => {
        expect(resolveLevel([], 'root')).toBeNull()
    })
})

describe('build the rows of one level', () => {
    const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

    test('lists the subfolders first and then the notes at the root, without a header', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'root'))

        expect(rows.map((row) => row.id)).toEqual([
            'folder:child-b',
            'folder:child-a',
            'note:note-apple',
            'note:note-zebra'
        ])
    })

    test('starts a nested folder with its header', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'child-a'))

        expect(rows[0].id).toBe('level:child-a')
    })

    test('only includes the direct children of the folder', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'child-a'))

        expect(rows.map((row) => row.id)).toEqual(['level:child-a', 'folder:grandchild'])
    })

    test('shows only the header for an empty nested folder', () => {
        const rows = buildLevelRows(findFolderNode(tree, 'child-b'))

        expect(rows.map((row) => row.id)).toEqual(['level:child-b'])
    })

    test('shows nothing for an empty root', () => {
        const rows = buildLevelRows({ folder: { id: 'empty' }, notes: [], subfolders: [] })

        expect(rows).toEqual([])
    })
})

describe('lazy note sorting', () => {
    test('sorts only the notes of the folder that is read', () => {
        const sortNotes = jest.spyOn(noteSort, 'sortNotes')
        const tree = buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY)

        expect(sortNotes).not.toHaveBeenCalled()

        buildLevelRows(findFolderNode(tree, 'child-a'))

        expect(sortNotes).toHaveBeenCalledTimes(1)
        sortNotes.mockRestore()
    })

    test('sorts a folder once however many times it is read', () => {
        const sortNotes = jest.spyOn(noteSort, 'sortNotes')
        const node = findFolderNode(
            buildFolderTree(MOCK_REPOSITORY_LIST, MOCK_NOTES_BY_REPOSITORY),
            'child-a'
        )

        buildLevelRows(node)
        buildLevelRows(node)

        expect(sortNotes).toHaveBeenCalledTimes(1)
        sortNotes.mockRestore()
    })
})
