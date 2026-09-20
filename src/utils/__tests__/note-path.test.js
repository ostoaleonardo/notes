import { buildRepositoryPaths, getNotePaths } from '../note-path'

describe('buildRepositoryPaths', () => {
    test('gives root repositories an empty path', () => {
        const repositories = [{ id: 'root', alias: 'Vault', parentId: null }]

        const paths = buildRepositoryPaths(repositories)

        expect(paths.get('root')).toBe('')
    })

    test('gives a subfolder its alias as the path', () => {
        const repositories = [
            { id: 'root', alias: 'Vault', parentId: null },
            { id: 'one', alias: 'one', parentId: 'root' }
        ]

        const paths = buildRepositoryPaths(repositories)

        expect(paths.get('one')).toBe('one')
    })

    test('joins nested subfolders with a slash', () => {
        const repositories = [
            { id: 'root', alias: 'Vault', parentId: null },
            { id: 'one', alias: 'one', parentId: 'root' },
            { id: 'two', alias: 'two', parentId: 'one' }
        ]

        const paths = buildRepositoryPaths(repositories)

        expect(paths.get('two')).toBe('one/two')
    })
})

describe('getNotePaths', () => {
    test('maps each note id to its repository path', () => {
        const repositories = [
            { id: 'root', alias: 'Vault', parentId: null },
            { id: 'one', alias: 'one', parentId: 'root' }
        ]
        const notes = [
            { id: 'a', repositoryId: 'root' },
            { id: 'b', repositoryId: 'one' }
        ]

        const paths = getNotePaths(notes, repositories)

        expect(paths.get('a')).toBe('')
        expect(paths.get('b')).toBe('one')
    })
})
