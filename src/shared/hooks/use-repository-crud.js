import { useCallback } from 'react'
import { Directory } from 'expo-file-system'

import { sanitizeFilename } from '@/shared/utils/note-filename'
import { buildFolderPaths } from '@/shared/utils/note-path'
import { withBusy } from '@/shared/utils/with-busy'
import { yieldToUi } from '@/shared/utils/yield-to-ui'
import { resolveAttachmentTarget } from '@/shared/utils/attachments'
import { FREE_SUBFOLDERS_PER_REPOSITORY } from '@/shared/constants/default-values'
import { TEMPLATES_FOLDER_NAME } from '@/shared/constants/file-storage'
import { REPOSITORY_RESULTS } from '@/shared/constants/repository-results'
import { PICKER_ERROR_CODES } from '@/shared/constants/picker-errors'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'

export function useRepositoryCrud({
    folders,
    activeFolder,
    activeFolderId,
    pro,
    busyRef,
    fileStorage,
    seedWelcomeNote,
    setPendingWelcomeNoteId,
    persistFolders,
    persistActiveFolder,
    getRootRepository,
    getDescendants,
    isAncestorOf,
    seedTemplates,
    buildFolder,
    discoverSubfolders,
    relinkUris
}) {
    const {
        createSubdirectory,
        deleteDirectory,
        renameFolder: renameFolderFiles,
        removeFolder: removeFolderFiles,
        findDirectory,
        getOrCreateTemplatesFolder,
        getOrCreateImagesFolder,
        deleteFolderIndex
    } = fileStorage

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

    const ensureTemplatesFolder = useCallback(async (folder) => {
        const root = getRootRepository(folder)
        const existing = findDirectory(root.uri, TEMPLATES_FOLDER_NAME)

        if (existing) {
            if (root.templatesUri !== existing.uri) {
                await persistFolders(folders.map((r) => (
                    r.id === root.id ? { ...r, templatesUri: existing.uri } : r
                )))
            }

            return existing.uri
        }

        return withBusy(busyRef, async () => {
            const templatesDirectory = getOrCreateTemplatesFolder(root.uri)
            seedTemplates(templatesDirectory.uri)

            await persistFolders(folders.map((r) => (
                r.id === root.id ? { ...r, templatesUri: templatesDirectory.uri } : r
            )))

            return templatesDirectory.uri
        })
    }, [
        getRootRepository,
        findDirectory,
        getOrCreateTemplatesFolder,
        seedTemplates,
        persistFolders,
        folders,
        busyRef
    ])

    const ensureImagesFolder = useCallback((folder) => {
        const root = getRootRepository(folder)
        return getOrCreateImagesFolder(root.uri).uri
    }, [getRootRepository, getOrCreateImagesFolder])

    const ensureAttachmentsFolder = useCallback((folder, settings) => {
        const { parentUri, folderName } = resolveAttachmentTarget(settings, {
            rootUri: getRootRepository(folder).uri,
            noteFolderUri: folder.uri
        })

        if (!folderName) return parentUri

        return (findDirectory(parentUri, folderName) || createSubdirectory(parentUri, folderName)).uri
    }, [getRootRepository, findDirectory, createSubdirectory])

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
                const oldPath = buildFolderPaths(folders).get(id)
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

    const removeRepositoriesFromList = useCallback(async (ids) => {
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
            await removeRepositoriesFromList([id, ...descendantIds])
        })
    }, [
        folders,
        getDescendants,
        removeRepositoriesFromList,
        busyRef
    ])

    const removeRepository = useCallback(async (id) => {
        const folder = folders.find((r) => r.id === id)
        if (!folder) return null

        if (activeFolder && isAncestorOf(id, activeFolder)) {
            return REPOSITORY_RESULTS.ACTIVE
        }

        return withBusy(busyRef, async () => {
            const path = buildFolderPaths(folders).get(id)
            const descendantIds = getDescendants(id).map((d) => d.id)

            await removeRepositoriesFromList([id, ...descendantIds])

            if (folder.parentId) {
                await removeFolderFiles({
                    rootUri: getRootRepository(folder).uri,
                    path,
                    folderIds: [id, ...descendantIds],
                    dropVersions: true
                })
            } else {
                deleteDirectory(folder.uri)
            }

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
        removeRepositoriesFromList,
        busyRef
    ])

    const setActiveFolder = useCallback((id) => {
        persistActiveFolder(id)
    }, [persistActiveFolder])

    return {
        addRepository,
        clearPendingWelcomeNote,
        addSubfolder,
        renameFolder,
        forgetRepository,
        removeRepository,
        setActiveFolder,
        ensureTemplatesFolder,
        ensureImagesFolder,
        ensureAttachmentsFolder
    }
}
