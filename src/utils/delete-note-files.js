import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/constants/delete-behavior'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export const readDeleteBehavior = async (getItem) => (
    (await getItem(STORAGE_KEYS.DELETE_BEHAVIOR)) || DEFAULT_DELETE_BEHAVIOR
)

export const deleteNoteFiles = async (behavior, location, fileStorage) => {
    const { uri, rootUri, filename } = location

    if (behavior === DELETE_BEHAVIORS.VAULT_TRASH) {
        const folder = fileStorage.getOrCreateVaultTrashFolder(rootUri)
        return fileStorage.moveNoteFiles(uri, filename, folder.uri)
    }

    fileStorage.deleteNoteFile(uri, filename)
    fileStorage.deleteVersions(uri, filename)
}
