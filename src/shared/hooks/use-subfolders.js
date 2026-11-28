import { useCallback } from 'react'

import { sanitizeFilename } from '@/shared/utils/note-filename'
import { buildFolderPathById } from '@/shared/utils/note-path'
import { withBusy } from '@/shared/utils/with-busy'
import { logError } from '@/shared/utils/log-error'
import { FREE_SUBFOLDERS_PER_REPOSITORY } from '@/shared/constants/default-values'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export function useSubfolders({
    folders,
    pro,
    busyRef,
    fileStorage,
    persistFolders,
    getRootRepository,
    getDescendants,
    buildFolder,
    relinkUris
}) {
    const { createSubdirectory, renameFolder: renameFolderFiles } = fileStorage

    const canAddSubfolder = useCallback((parentId) => {
        if (pro) return true

        const parent = folders.find((folder) => folder.id === parentId)
        if (!parent) return false
        if (parent.parentId) return false

        const siblingCount = folders.filter((folder) => folder.parentId === parentId).length
        return siblingCount < FREE_SUBFOLDERS_PER_REPOSITORY
    }, [pro, folders])

    const addSubfolder = useCallback(async (parentId, name) => {
        if (!canAddSubfolder(parentId)) return REPOSITORY_RESULTS.PRO_REQUIRED

        const parent = folders.find((folder) => folder.id === parentId)
        if (!parent) return null

        return withBusy(busyRef, async () => {
            const directory = createSubdirectory(parent.uri, sanitizeFilename(name, ''))
            const folder = buildFolder(directory, parentId, false)

            await persistFolders([...folders, folder])
            return folder
        })
    }, [
        folders,
        buildFolder,
        canAddSubfolder,
        createSubdirectory,
        persistFolders,
        busyRef
    ])

    const renameFolder = useCallback(async (id, alias) => {
        const folder = folders.find((r) => r.id === id)
        if (!folder) return null

        if (!folder.parentId) {
            await persistFolders(folders.map((r) => (r.id === id ? { ...r, alias } : r)))
            return folder
        }

        return withBusy(busyRef, async () => {
            try {
                const parent = folders.find((r) => r.id === folder.parentId)
                if (!parent) return REPOSITORY_RESULTS.ERROR

                const sanitized = sanitizeFilename(alias, '')
                const oldPath = buildFolderPathById(folders).get(id)
                const affected = [id, ...getDescendants(id).map((d) => d.id)]
                const { uri: newUri } = await renameFolderFiles({
                    rootUri: getRootRepository(folder).uri,
                    path: oldPath,
                    newName: sanitized,
                    folderIds: affected,
                    parentUri: parent.uri
                })
                const renamedFolder = { ...folder, uri: newUri, alias: sanitized }
                const relinked = await relinkUris(renamedFolder)
                const relinkedById = new Map(relinked.map((r) => [r.id, r]))

                await persistFolders(folders.map((r) => {
                    if (r.id === id) return renamedFolder
                    return relinkedById.get(r.id) || r
                }))

                return renamedFolder
            } catch (error) {
                logError(LOG_MESSAGES.ERROR_RENAMING_REPOSITORY_FOLDER, error)
                return REPOSITORY_RESULTS.ERROR
            }
        })
    }, [
        folders,
        persistFolders,
        renameFolderFiles,
        getRootRepository,
        getDescendants,
        relinkUris,
        busyRef
    ])

    return { addSubfolder, renameFolder }
}
