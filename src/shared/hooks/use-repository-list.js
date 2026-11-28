import { useCallback } from 'react'
import { Directory } from 'expo-file-system'

import { withBusy } from '@/shared/utils/with-busy'
import { yieldToUi } from '@/shared/utils/yield-to-ui'
import { buildFolderPathById } from '@/shared/utils/note-path'
import { logError } from '@/shared/utils/log-error'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'
import { PICKER_ERROR_CODES } from '@/shared/constants/picker-errors'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export function useRepositoryList({
    folders,
    activeFolder,
    activeFolderId,
    busyRef,
    fileStorage,
    seedWelcomeNote,
    setPendingWelcomeNoteId,
    persistFolders,
    persistActiveFolder,
    getRootRepository,
    getDescendants,
    isAncestorOf,
    buildFolder,
    discoverSubfolders
}) {
    const { deleteDirectory, removeFolder: removeFolderFiles, deleteFolderIndex } = fileStorage

    const addRepository = useCallback((onPicked) => withBusy(busyRef, async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()
            onPicked?.()
            await yieldToUi()

            if (folders.some((folder) => folder.uri === directory.uri)) {
                return REPOSITORY_RESULTS.DUPLICATE
            }

            const folder = buildFolder(directory)
            const discovered = await discoverSubfolders(directory, folder.id)
            const welcomeNotePath = await seedWelcomeNote(directory.uri, folder.id)
            if (welcomeNotePath) setPendingWelcomeNoteId(welcomeNotePath)

            await persistFolders([...folders, folder, ...discovered])
            if (!activeFolderId) await persistActiveFolder(folder.id)

            return { ...folder, welcomeNotePath }
        } catch (error) {
            if (error.code === PICKER_ERROR_CODES.CANCELLED) return null

            logError(LOG_MESSAGES.ERROR_PICKING_REPOSITORY, error)
            return REPOSITORY_RESULTS.ERROR
        }
    }), [
        folders,
        activeFolderId,
        buildFolder,
        discoverSubfolders,
        seedWelcomeNote,
        setPendingWelcomeNoteId,
        persistFolders,
        persistActiveFolder,
        busyRef
    ])

    const clearPendingWelcomeNote = useCallback(() => {
        setPendingWelcomeNoteId(null)
    }, [setPendingWelcomeNoteId])

    const removeFoldersFromList = useCallback(async (ids) => {
        const idSet = new Set(ids)
        const remaining = folders.filter((r) => !idSet.has(r.id))
        await persistFolders(remaining)
        ids.forEach(deleteFolderIndex)

        if (idSet.has(activeFolderId)) {
            await persistActiveFolder(remaining[0]?.id || '')
        }
    }, [
        folders,
        persistFolders,
        deleteFolderIndex,
        activeFolderId,
        persistActiveFolder
    ])

    const forgetRepository = useCallback(async (id) => {
        const folder = folders.find((r) => r.id === id)
        if (!folder) return

        return withBusy(busyRef, async () => {
            const descendantIds = getDescendants(id).map((d) => d.id)
            await removeFoldersFromList([id, ...descendantIds])
        })
    }, [
        folders,
        getDescendants,
        removeFoldersFromList,
        busyRef
    ])

    const deleteFolder = useCallback(async (id) => {
        const folder = folders.find((r) => r.id === id)
        if (!folder) return null

        if (activeFolder && isAncestorOf(id, activeFolder)) {
            return REPOSITORY_RESULTS.ACTIVE
        }

        return withBusy(busyRef, async () => {
            const path = buildFolderPathById(folders).get(id)
            const descendantIds = getDescendants(id).map((d) => d.id)

            try {
                if (folder.parentId) {
                    await removeFolderFiles({
                        rootUri: getRootRepository(folder).uri,
                        path,
                        folderIds: [id, ...descendantIds],
                        dropVersions: true
                    })
                } else {
                    await deleteDirectory(folder.uri)
                }
            } catch {
                return REPOSITORY_RESULTS.ERROR
            }

            await removeFoldersFromList([id, ...descendantIds])

            return folder
        })
    }, [
        folders,
        activeFolder,
        isAncestorOf,
        deleteDirectory,
        removeFolderFiles,
        getRootRepository,
        getDescendants,
        removeFoldersFromList,
        busyRef
    ])



    const setActiveFolder = useCallback((id) => {
        persistActiveFolder(id)
    }, [persistActiveFolder])

    return {
        addRepository,
        clearPendingWelcomeNote,
        forgetRepository,
        deleteFolder,
        setActiveFolder
    }
}
