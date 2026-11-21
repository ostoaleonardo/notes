import { deleteNoteFiles } from '../delete-note-files'

const location = {
    uri: 'file:///vault/sub',
    rootUri: 'file:///vault',
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
    test('moves the note into the vault root trash folder', async () => {
        const fileStorage = createFileStorage()

        const target = await deleteNoteFiles('vault-trash', location, fileStorage)

        expect(target).toBe('Groceries.md')
        expect(fileStorage.trashNote).toHaveBeenCalledWith({
            rootUri: 'file:///vault',
            folderId: 'sub-id',
            folderPath: 'sub',
            filename: 'Groceries.md'
        })
        expect(fileStorage.deleteNoteFile).not.toHaveBeenCalled()
    })

    test('deletes the note and its versions for permanent deletion', async () => {
        const fileStorage = createFileStorage()

        await deleteNoteFiles('permanent', location, fileStorage)

        expect(fileStorage.deleteNoteFile).toHaveBeenCalledWith('file:///vault/sub', 'Groceries.md')
        expect(fileStorage.deleteVersions).toHaveBeenCalledWith('file:///vault', 'sub/Groceries.md')
        expect(fileStorage.trashNote).not.toHaveBeenCalled()
    })
})
