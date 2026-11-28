import { buildNotePath, buildFolderPathById, getFolderPathByNote } from '../note-path'

describe('build note path', () => {
    test('joins the folder id and filename with the separator', () => {
        expect(buildNotePath('repo-1', 'Note.md')).toBe('repo-1::Note.md')
    })
})

describe('build folder paths', () => {
    test('gives root folders an empty path', () => {
        const folders = [{ id: 'root', alias: 'Repository', parentId: null }]

        const paths = buildFolderPathById(folders)

        expect(paths.get('root')).toBe('')
    })

    test('gives a subfolder its alias as the path', () => {
        const folders = [
            { id: 'root', alias: 'Repository', parentId: null },
            { id: 'one', alias: 'one', parentId: 'root' }
        ]

        const paths = buildFolderPathById(folders)

        expect(paths.get('one')).toBe('one')
    })

    test('joins nested subfolders with a slash', () => {
        const folders = [
            { id: 'root', alias: 'Repository', parentId: null },
            { id: 'one', alias: 'one', parentId: 'root' },
            { id: 'two', alias: 'two', parentId: 'one' }
        ]

        const paths = buildFolderPathById(folders)

        expect(paths.get('two')).toBe('one/two')
    })
})

describe('get note paths', () => {
    test('maps each note path to its folder path', () => {
        const folders = [
            { id: 'root', alias: 'Repository', parentId: null },
            { id: 'one', alias: 'one', parentId: 'root' }
        ]
        const notes = [
            { path: 'root::a.md', folderId: 'root' },
            { path: 'one::b.md', folderId: 'one' }
        ]

        const paths = getFolderPathByNote(notes, folders)

        expect(paths.get('root::a.md')).toBe('')
        expect(paths.get('one::b.md')).toBe('one')
    })
})
