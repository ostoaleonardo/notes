import { deleteNoteFiles } from '../delete-note-files'

const location = {
    uri: 'file:///repository/sub',
    rootUri: 'file:///repository',
    folderId: 'sub-id',
    folderPath: 'sub',
    filename: 'Groceries.md'
}

const createFileStorage = () => ({
    trashNote: jest.fn(async () => 'Groceries.md'),
    deleteNoteFile: jest.fn(),
    deleteVersions: jest.fn()
})

describe('delete note files', () => {
    test('moves the note into the repository root trash folder', async () => {
        const fileStorage = createFileStorage()

        const target = await deleteNoteFiles('repository-trash', location, fileStorage)

        expect(target).toBe('Groceries.md')
        expect(fileStorage.trashNote).toHaveBeenCalledWith({
            rootUri: 'file:///repository',
            folderId: 'sub-id',
            folderPath: 'sub',
            filename: 'Groceries.md'
        })
        expect(fileStorage.deleteNoteFile).not.toHaveBeenCalled()
    })

    test('deletes the note and its versions for permanent deletion', async () => {
        const fileStorage = createFileStorage()

        await deleteNoteFiles('permanent', location, fileStorage)

        expect(fileStorage.deleteNoteFile).toHaveBeenCalledWith('file:///repository/sub', 'Groceries.md')
        expect(fileStorage.deleteVersions).toHaveBeenCalledWith('file:///repository', 'sub/Groceries.md')
        expect(fileStorage.trashNote).not.toHaveBeenCalled()
    })
})
