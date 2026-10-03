import { DELETE_BEHAVIORS } from '@/constants/delete-behavior'

export const deleteNoteFiles = async (behavior, location, fileStorage) => {
    const { uri, rootUri, filename } = location

    if (behavior === DELETE_BEHAVIORS.VAULT_TRASH) {
        const folder = fileStorage.getOrCreateVaultTrashFolder(rootUri)
        return fileStorage.moveNoteFiles(uri, filename, folder.uri)
    }

    fileStorage.deleteNoteFile(uri, filename)
    fileStorage.deleteVersions(uri, filename)
}
