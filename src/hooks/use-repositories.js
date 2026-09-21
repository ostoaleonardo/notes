import { useCallback, useContext } from 'react'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { usePro } from './use-pro'
import { useWelcomeNote } from './use-welcome-note'
import { useRepositoryTree } from './use-repository-tree'
import { useRepositoryTreeOps } from './use-repository-tree-ops'
import { useRepositoryCrud } from './use-repository-crud'
import { useRepositorySync } from './use-repository-sync'
import { RepositoryContext } from '../context/repository-context'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useRepositories() {
    const { setItem } = useStorage()
    const { pro } = usePro()
    const { seedWelcomeNote } = useWelcomeNote()
    const fileStorage = useFileStorage()

    const {
        repositories,
        setRepositories,
        activeRepositoryId,
        setActiveRepositoryId,
        loading,
        reconciled,
        setReconciled,
        pendingWelcomeNoteId,
        setPendingWelcomeNoteId,
        busyRef
    } = useContext(RepositoryContext)

    const activeRepository = repositories.find((repository) => repository.id === activeRepositoryId) || null

    const persistRepositories = useCallback(async (localRepositories) => {
        setRepositories(localRepositories)
        await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(localRepositories))
    }, [setRepositories, setItem])

    const persistActiveRepository = useCallback(async (id) => {
        setActiveRepositoryId(id)
        await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, id)
    }, [setActiveRepositoryId, setItem])

    const tree = useRepositoryTree({ repositories, activeRepository })
    const treeOps = useRepositoryTreeOps({ repositories, fileStorage })

    const crud = useRepositoryCrud({
        repositories,
        activeRepository,
        activeRepositoryId,
        pro,
        busyRef,
        fileStorage,
        seedWelcomeNote,
        setPendingWelcomeNoteId,
        persistRepositories,
        persistActiveRepository,
        getRootRepository: tree.getRootRepository,
        getDescendants: tree.getDescendants,
        isAncestorOf: tree.isAncestorOf,
        seedTemplates: treeOps.seedTemplates,
        buildRepository: treeOps.buildRepository,
        discoverSubfolders: treeOps.discoverSubfolders,
        relinkUris: treeOps.relinkUris
    })

    const { reconcileRepositories } = useRepositorySync({
        repositories,
        activeRepositoryId,
        busyRef,
        directoryExists: fileStorage.directoryExists,
        listSubdirectories: fileStorage.listSubdirectories,
        buildRepository: treeOps.buildRepository,
        discoverSubfolders: treeOps.discoverSubfolders,
        persistRepositories,
        persistActiveRepository
    })

    return {
        repositories,
        activeRepositoryTree: tree.activeRepositoryTree,
        activeRepository,
        activeRepositoryId,
        loading,
        reconciled,
        setReconciled,
        pendingWelcomeNoteId,
        clearPendingWelcomeNote: crud.clearPendingWelcomeNote,
        addRepository: crud.addRepository,
        addSubfolder: crud.addSubfolder,
        renameRepository: crud.renameRepository,
        forgetRepository: crud.forgetRepository,
        removeRepository: crud.removeRepository,
        setActiveRepository: crud.setActiveRepository,
        ensureTemplatesFolder: crud.ensureTemplatesFolder,
        ensureImagesFolder: crud.ensureImagesFolder,
        getDescendants: tree.getDescendants,
        buildRepository: treeOps.buildRepository,
        reconcileRepositories
    }
}
