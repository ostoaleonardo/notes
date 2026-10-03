import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/constants/delete-behavior'
import { buildVersionKey } from '@/utils/note-version-location'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export const readDeleteBehavior = async (getItem) => (
    (await getItem(STORAGE_KEYS.DELETE_BEHAVIOR)) || DEFAULT_DELETE_BEHAVIOR
)

export const deleteNoteFiles = async (behavior, location, fileStorage) => {
    const { uri, rootUri, folderPath, filename } = location
    const key = buildVersionKey(folderPath, filename)

    if (behavior === DELETE_BEHAVIORS.VAULT_TRASH) {
        const folder = fileStorage.getOrCreateVaultTrashFolder(rootUri)
        const target = await fileStorage.moveNoteFiles(uri, filename, folder.uri)

        fileStorage.deleteVersions(rootUri, key)
        return target
    }

    fileStorage.deleteNoteFile(uri, filename)
    fileStorage.deleteVersions(rootUri, key)
}
