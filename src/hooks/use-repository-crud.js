import { useCallback } from 'react'
import { Directory } from 'expo-file-system'

import { sanitizeFilename } from '@/utils/note-filename'
import { withBusy } from '@/utils/with-busy'
import { FREE_SUBFOLDERS_PER_REPOSITORY } from '@/constants/default-values'
import { TEMPLATES_FOLDER_NAME } from '@/constants/file-storage'

export function useRepositoryCrud({
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
    getRootRepository,
    getDescendants,
    isAncestorOf,
    seedTemplates,
    buildRepository,
    discoverSubfolders,
    relinkUris
}) {
    const {
        createSubdirectory,
        deleteDirectory,
        renameDirectory,
        findDirectory,
        getOrCreateTemplatesFolder,
        getOrCreateImagesFolder
    } = fileStorage

    const addRepository = useCallback(() => withBusy(busyRef, async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) {
                return 'duplicate'
            }

            const repository = buildRepository(directory)
            const discovered = discoverSubfolders(directory, repository.id)
            const welcomeNotePath = await seedWelcomeNote(directory.uri, repository.id)
            if (welcomeNotePath) setPendingWelcomeNoteId(welcomeNotePath)

            await persistRepositories([...repositories, repository, ...discovered])
            if (!activeRepositoryId) await persistActiveRepository(repository.id)

            return { ...repository, welcomeNotePath }
        } catch (error) {
            if (error.code === 'ERR_PICKER_CANCELLED') return null

            console.debug('error picking repository', error)
            return 'error'
        }
    }), [
        repositories,
        activeRepositoryId,
        buildRepository,
        discoverSubfolders,
        seedWelcomeNote,
        setPendingWelcomeNoteId,
        persistRepositories,
        persistActiveRepository,
        busyRef
    ])

    const clearPendingWelcomeNote = useCallback(() => {
        setPendingWelcomeNoteId(null)
    }, [setPendingWelcomeNoteId])

    const canAddSubfolder = useCallback((parentId) => {
        if (pro) return true

        const parent = repositories.find((repository) => repository.id === parentId)
        if (!parent) return false
        if (parent.parentId) return false

        const siblingCount = repositories.filter((repository) => repository.parentId === parentId).length
        return siblingCount < FREE_SUBFOLDERS_PER_REPOSITORY
    }, [pro, repositories])

    const addSubfolder = useCallback(async (parentId, name) => {
        if (!canAddSubfolder(parentId)) return 'pro_required'

        const parent = repositories.find((repository) => repository.id === parentId)
        if (!parent) return null

        return withBusy(busyRef, async () => {
            const directory = createSubdirectory(parent.uri, sanitizeFilename(name))
            const repository = buildRepository(directory, parentId, false)

            await persistRepositories([...repositories, repository])
            return repository
        })
    }, [
        repositories,
        buildRepository,
        canAddSubfolder,
        createSubdirectory,
        persistRepositories,
        busyRef
    ])

    const ensureTemplatesFolder = useCallback(async (repository) => {
        const root = getRootRepository(repository)
        const existing = findDirectory(root.uri, TEMPLATES_FOLDER_NAME)

        if (existing) {
            if (root.templatesUri !== existing.uri) {
                await persistRepositories(repositories.map((r) => (
                    r.id === root.id ? { ...r, templatesUri: existing.uri } : r
                )))
            }

            return existing.uri
        }

        return withBusy(busyRef, async () => {
            const templatesDirectory = getOrCreateTemplatesFolder(root.uri)
            seedTemplates(templatesDirectory.uri)

            await persistRepositories(repositories.map((r) => (
                r.id === root.id ? { ...r, templatesUri: templatesDirectory.uri } : r
            )))

            return templatesDirectory.uri
        })
    }, [getRootRepository, findDirectory, getOrCreateTemplatesFolder, seedTemplates, persistRepositories, repositories, busyRef])

    const ensureImagesFolder = useCallback((repository) => {
        const root = getRootRepository(repository)
        return getOrCreateImagesFolder(root.uri).uri
    }, [getRootRepository, getOrCreateImagesFolder])

    const renameRepository = useCallback(async (id, alias) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return null

        if (!repository.parentId) {
            await persistRepositories(repositories.map((r) => (r.id === id ? { ...r, alias } : r)))
            return repository
        }

        return withBusy(busyRef, async () => {
            try {
                const parent = repositories.find((r) => r.id === repository.parentId)
                if (!parent) return 'error'

                const sanitized = sanitizeFilename(alias)
                const newUri = renameDirectory(repository.uri, parent.uri, sanitized)
                const renamedRepository = { ...repository, uri: newUri, alias: sanitized }
                const relinked = relinkUris(renamedRepository)
                const relinkedById = new Map(relinked.map((r) => [r.id, r]))

                await persistRepositories(repositories.map((r) => {
                    if (r.id === id) return renamedRepository
                    return relinkedById.get(r.id) || r
                }))

                return renamedRepository
            } catch (error) {
                console.debug('error renaming repository folder', error)
                return 'error'
            }
        })
    }, [
        repositories,
        persistRepositories,
        renameDirectory,
        relinkUris,
        busyRef
    ])

    const removeRepositoriesFromList = useCallback(async (ids) => {
        const idSet = new Set(ids)
        const remaining = repositories.filter((r) => !idSet.has(r.id))
        await persistRepositories(remaining)

        if (idSet.has(activeRepositoryId)) {
            await persistActiveRepository(remaining[0]?.id || '')
        }
    }, [repositories, persistRepositories, activeRepositoryId, persistActiveRepository])

    const forgetRepository = useCallback(async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return

        return withBusy(busyRef, async () => {
            const descendantIds = getDescendants(id).map((d) => d.id)
            await removeRepositoriesFromList([id, ...descendantIds])
        })
    }, [
        repositories,
        getDescendants,
        removeRepositoriesFromList,
        busyRef
    ])

    const removeRepository = useCallback(async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return null

        if (activeRepository && isAncestorOf(id, activeRepository)) {
            return 'active'
        }

        return withBusy(busyRef, async () => {
            deleteDirectory(repository.uri)

            const descendantIds = getDescendants(id).map((d) => d.id)
            await removeRepositoriesFromList([id, ...descendantIds])

            return repository
        })
    }, [
        repositories,
        activeRepository,
        isAncestorOf,
        deleteDirectory,
        getDescendants,
        removeRepositoriesFromList,
        busyRef
    ])

    const setActiveRepository = useCallback((id) => {
        persistActiveRepository(id)
    }, [persistActiveRepository])

    return {
        addRepository,
        clearPendingWelcomeNote,
        addSubfolder,
        renameRepository,
        forgetRepository,
        removeRepository,
        setActiveRepository,
        ensureTemplatesFolder,
        ensureImagesFolder
    }
}
