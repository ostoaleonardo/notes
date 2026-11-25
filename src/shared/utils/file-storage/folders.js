import { File } from 'expo-file-system'

import { repositoryEngine } from '@/shared/utils/repository-engine'
import { invalidateMediaIndex } from '@/shared/utils/media-index'
import { buildVersionKey } from '@/shared/utils/note-version-location'
import { listMarkdownFiles } from './entries'
import { deleteVersions } from './versions'

export const renameFolder = async ({ rootUri, path, newName, folderIds, parentUri }) => {
    const renamed = await repositoryEngine.renameFolder(rootUri, path, newName, folderIds, parentUri)
    invalidateMediaIndex()

    return renamed
}

export const removeFolder = async ({ rootUri, path, folderIds, dropVersions }) => {
    await repositoryEngine.removeFolder(rootUri, path, folderIds, dropVersions)
    invalidateMediaIndex()
}

export const clearRepository = async (directoryUri, { rootUri, folderPath }) => {
    for (const file of listMarkdownFiles(directoryUri)) {
        new File(file.uri).delete()
        await deleteVersions(rootUri, buildVersionKey(folderPath, file.name))
    }
}
