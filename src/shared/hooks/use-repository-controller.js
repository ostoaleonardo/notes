import { useCallback, useContext, useMemo } from 'react'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { usePro } from './use-pro'
import { useWelcomeNote } from './use-welcome-note'
import { useFolderTree } from './use-folder-tree'
import { useFolderTreeOps } from './use-folder-tree-ops'
import { useRepositoryList } from './use-repository-list'
import { useSubfolders } from './use-subfolders'
import { useSpecialFolders } from './use-special-folders'
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

    const list = useRepositoryList({
        folders,
        activeFolder,
        activeFolderId,
        busyRef,
        fileStorage,
        seedWelcomeNote,
        setPendingWelcomeNoteId,
        persistFolders,
        persistActiveFolder,
        getRootRepository: tree.getRootRepository,
        getDescendants: tree.getDescendants,
        isAncestorOf: tree.isAncestorOf,
        buildFolder: treeOps.buildFolder,
        discoverSubfolders: treeOps.discoverSubfolders
    })

    const subfolders = useSubfolders({
        folders,
        pro,
        busyRef,
        fileStorage,
        persistFolders,
        getRootRepository: tree.getRootRepository,
        getDescendants: tree.getDescendants,
        buildFolder: treeOps.buildFolder,
        relinkUris: treeOps.relinkUris
    })

    const special = useSpecialFolders({
        folders,
        busyRef,
        fileStorage,
        persistFolders,
        getRootRepository: tree.getRootRepository,
        seedTemplates: treeOps.seedTemplates
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
        clearPendingWelcomeNote: list.clearPendingWelcomeNote,
        addRepository: list.addRepository,
        addSubfolder: subfolders.addSubfolder,
        renameFolder: subfolders.renameFolder,
        forgetRepository: list.forgetRepository,
        deleteFolder: list.deleteFolder,
        setActiveFolder: list.setActiveFolder,
        ensureTemplatesFolder: special.ensureTemplatesFolder,
        ensureImagesFolder: special.ensureImagesFolder,
        ensureAttachmentsFolder: special.ensureAttachmentsFolder,
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
        list.clearPendingWelcomeNote,
        list.addRepository,
        subfolders.addSubfolder,
        subfolders.renameFolder,
        list.forgetRepository,
        list.deleteFolder,
        list.setActiveFolder,
        special.ensureTemplatesFolder,
        special.ensureImagesFolder,
        special.ensureAttachmentsFolder,
        tree.getDescendants,
        tree.getRootRepository,
        treeOps.buildFolder,
        reconcileFolders
    ])
}
