import { deleteNoteFiles } from '../delete-note-files'

const location = {
    uri: 'file:///vault/sub',
    rootUri: 'file:///vault',
    filename: 'Groceries.md'
}

const createFileStorage = () => ({
    getOrCreateVaultTrashFolder: jest.fn(() => ({ uri: 'file:///vault/.trash' })),
    moveNoteFiles: jest.fn(async () => 'Groceries.md'),
    deleteNoteFile: jest.fn(),
    deleteVersions: jest.fn()
})

describe('delete note files', () => {
    test('moves the note into the vault root trash folder', async () => {
        const fileStorage = createFileStorage()

        await deleteNoteFiles('vault-trash', location, fileStorage)

        expect(fileStorage.getOrCreateVaultTrashFolder).toHaveBeenCalledWith('file:///vault')
        expect(fileStorage.moveNoteFiles).toHaveBeenCalledWith(
            'file:///vault/sub',
            'Groceries.md',
            'file:///vault/.trash'
        )
    })

    test('deletes the note and its versions for permanent deletion', async () => {
        const fileStorage = createFileStorage()

        await deleteNoteFiles('permanent', location, fileStorage)

        expect(fileStorage.deleteNoteFile).toHaveBeenCalledWith('file:///vault/sub', 'Groceries.md')
        expect(fileStorage.deleteVersions).toHaveBeenCalledWith('file:///vault/sub', 'Groceries.md')
        expect(fileStorage.moveNoteFiles).not.toHaveBeenCalled()
    })
})
