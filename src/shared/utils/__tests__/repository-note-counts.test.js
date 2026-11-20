import {
    getChildFolderCounts,
    getRepositoryNoteCount,
    getRepositoryNoteCounts
} from '../repository-note-counts'

describe('repository note count', () => {
    test('returns the number of markdown files at the given uri', async () => {
        const scanMarkdownFiles = async (uri) => (
            uri === 'repo-a' ? [{ name: 'a.md' }, { name: 'b.md' }] : []
        )

        expect(await getRepositoryNoteCount('repo-a', scanMarkdownFiles)).toBe(2)
    })
})

describe('repository note counts', () => {
    test('maps each folder id to its note count', async () => {
        const folders = [
            { id: 'r1', uri: 'repo-a' },
            { id: 'r2', uri: 'repo-b' }
        ]
        const scanMarkdownFiles = async (uri) => (uri === 'repo-a' ? [{ name: 'a.md' }] : [])

        expect(await getRepositoryNoteCounts(folders, scanMarkdownFiles)).toEqual({ r1: 1, r2: 0 })
    })

    test('returns an empty object for no repositories', async () => {
        expect(await getRepositoryNoteCounts([], async () => [])).toEqual({})
    })
})

describe('child folder counts', () => {
    test('counts the direct children of each folder', () => {
        const descendants = [
            { id: 'a', parentId: 'root' },
            { id: 'b', parentId: 'a' },
            { id: 'c', parentId: 'a' }
        ]

        expect(getChildFolderCounts(descendants)).toEqual({ root: 1, a: 2 })
    })

    test('returns an empty object when there are no folders', () => {
        expect(getChildFolderCounts([])).toEqual({})
    })
})
