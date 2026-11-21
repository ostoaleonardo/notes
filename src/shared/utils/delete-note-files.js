import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/shared/constants/delete-behavior'
import { buildVersionKey } from '@/shared/utils/note-version-location'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

export const readDeleteBehavior = async (getItem) => (
    (await getItem(STORAGE_KEYS.DELETE_BEHAVIOR)) || DEFAULT_DELETE_BEHAVIOR
)

export const deleteNoteFiles = async (behavior, location, fileStorage) => {
    const { uri, rootUri, folderId, folderPath, filename } = location
    const key = buildVersionKey(folderPath, filename)

    if (behavior === DELETE_BEHAVIORS.VAULT_TRASH) {
        return fileStorage.trashNote({ rootUri, folderId, folderPath, filename })
    }

    fileStorage.deleteNoteFile(uri, filename)
    await fileStorage.deleteVersions(rootUri, key)
}
