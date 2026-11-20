import { useCallback, useContext, useMemo } from 'react'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { usePro } from './use-pro'
import { useWelcomeNote } from './use-welcome-note'
import { useFolderTree } from './use-folder-tree'
import { useFolderTreeOps } from './use-folder-tree-ops'
import { useRepositoryCrud } from './use-repository-crud'
import { useRepositorySync } from './use-repository-sync'
import { RepositoryStateContext } from '@/shared/context/repository-state-context'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

export function useRepositoryController() {
    const { setItem } = useStorage()
    const { pro } = usePro()
    const { seedWelcomeNote } = useWelcomeNote()
    const fileStorage = useFileStorage()

    const {
        folders,
        setFolders,
        activeFolderId,
        setActiveFolderId,
        loading,
        pendingWelcomeNoteId,
        setPendingWelcomeNoteId,
        busyRef
    } = useContext(RepositoryStateContext)

    const activeFolder = useMemo(
        () => folders.find((folder) => folder.id === activeFolderId) || null,
        [folders, activeFolderId]
    )

    const persistFolders = useCallback(async (localFolders) => {
        setFolders(localFolders)
        await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(localFolders))
    }, [setFolders, setItem])

    const persistActiveFolder = useCallback(async (id) => {
        setActiveFolderId(id)
        await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, id)
    }, [setActiveFolderId, setItem])

    const tree = useFolderTree({ folders, activeFolder })
    const treeOps = useFolderTreeOps({ folders, fileStorage })

    const crud = useRepositoryCrud({
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
        getRootRepository: tree.getRootRepository,
        getDescendants: tree.getDescendants,
        isAncestorOf: tree.isAncestorOf,
        seedTemplates: treeOps.seedTemplates,
        buildFolder: treeOps.buildFolder,
        discoverSubfolders: treeOps.discoverSubfolders,
        relinkUris: treeOps.relinkUris
    })

    const { reconcileFolders } = useRepositorySync({
        folders,
        activeFolderId,
        busyRef,
        directoryExists: fileStorage.directoryExists,
        scanSubdirectories: fileStorage.scanSubdirectories,
        deleteFolderIndex: fileStorage.deleteFolderIndex,
        buildFolder: treeOps.buildFolder,
        discoverSubfolders: treeOps.discoverSubfolders,
        persistFolders,
        persistActiveFolder
    })

    return useMemo(() => ({
        folders,
        activeFolderTree: tree.activeFolderTree,
        activeFolder,
        activeFolderId,
        loading,
        pendingWelcomeNoteId,
        clearPendingWelcomeNote: crud.clearPendingWelcomeNote,
        addRepository: crud.addRepository,
        addSubfolder: crud.addSubfolder,
        renameFolder: crud.renameFolder,
        forgetRepository: crud.forgetRepository,
        removeRepository: crud.removeRepository,
        setActiveFolder: crud.setActiveFolder,
        ensureTemplatesFolder: crud.ensureTemplatesFolder,
        ensureImagesFolder: crud.ensureImagesFolder,
        ensureAttachmentsFolder: crud.ensureAttachmentsFolder,
        getDescendants: tree.getDescendants,
        getRootRepository: tree.getRootRepository,
        buildFolder: treeOps.buildFolder,
        reconcileFolders
    }), [
        folders,
        tree.activeFolderTree,
        activeFolder,
        activeFolderId,
        loading,
        pendingWelcomeNoteId,
        crud.clearPendingWelcomeNote,
        crud.addRepository,
        crud.addSubfolder,
        crud.renameFolder,
        crud.forgetRepository,
        crud.removeRepository,
        crud.setActiveFolder,
        crud.ensureTemplatesFolder,
        crud.ensureImagesFolder,
        crud.ensureAttachmentsFolder,
        tree.getDescendants,
        tree.getRootRepository,
        treeOps.buildFolder,
        reconcileFolders
    ])
}
