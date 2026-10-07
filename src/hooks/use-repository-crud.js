import { useCallback } from 'react'
import { Directory } from 'expo-file-system'

import { sanitizeFilename } from '@/utils/note-filename'
import { buildRepositoryPaths } from '@/utils/note-path'
import { withBusy } from '@/utils/with-busy'
import { resolveAttachmentTarget } from '@/utils/attachments'
import { FREE_SUBFOLDERS_PER_REPOSITORY } from '@/constants/default-values'
import { TEMPLATES_FOLDER_NAME } from '@/constants/file-storage'
import { REPOSITORY_RESULTS } from '@/constants/repository-results'
import { PICKER_ERROR_CODES } from '@/constants/picker-errors'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

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
        getOrCreateImagesFolder,
        renameVersionsUnder,
        deleteVersionsUnder
    } = fileStorage

    const addRepository = useCallback(() => withBusy(busyRef, async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) {
                return REPOSITORY_RESULTS.DUPLICATE
            }

            const repository = buildRepository(directory)
            const discovered = discoverSubfolders(directory, repository.id)
            const welcomeNotePath = await seedWelcomeNote(directory.uri, repository.id)
            if (welcomeNotePath) setPendingWelcomeNoteId(welcomeNotePath)

            await persistRepositories([...repositories, repository, ...discovered])
            if (!activeRepositoryId) await persistActiveRepository(repository.id)

            return { ...repository, welcomeNotePath }
        } catch (error) {
            if (error.code === PICKER_ERROR_CODES.CANCELLED) return null

            logError(LOG_MESSAGES.ERROR_PICKING_REPOSITORY, error)
            return REPOSITORY_RESULTS.ERROR
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
        if (!canAddSubfolder(parentId)) return REPOSITORY_RESULTS.PRO_REQUIRED

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
    }, [
        getRootRepository,
        findDirectory,
        getOrCreateTemplatesFolder,
        seedTemplates,
        persistRepositories,
        repositories,
        busyRef
    ])

    const ensureImagesFolder = useCallback((repository) => {
        const root = getRootRepository(repository)
        return getOrCreateImagesFolder(root.uri).uri
    }, [getRootRepository, getOrCreateImagesFolder])

    const ensureAttachmentsFolder = useCallback((repository, settings) => {
        const { parentUri, folderName } = resolveAttachmentTarget(settings, {
            rootUri: getRootRepository(repository).uri,
            noteFolderUri: repository.uri
        })

        if (!folderName) return parentUri

        return (findDirectory(parentUri, folderName) || createSubdirectory(parentUri, folderName)).uri
    }, [getRootRepository, findDirectory, createSubdirectory])

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
                if (!parent) return REPOSITORY_RESULTS.ERROR

                const sanitized = sanitizeFilename(alias)
                const paths = buildRepositoryPaths(repositories)
                const oldPath = paths.get(id)
                const parentPath = paths.get(parent.id)
                const newPath = parentPath ? `${parentPath}/${sanitized}` : sanitized
                const newUri = await renameDirectory(repository.uri, parent.uri, sanitized)
                await renameVersionsUnder(getRootRepository(repository).uri, oldPath, newPath)
                const renamedRepository = { ...repository, uri: newUri, alias: sanitized }
                const relinked = relinkUris(renamedRepository)
                const relinkedById = new Map(relinked.map((r) => [r.id, r]))

                await persistRepositories(repositories.map((r) => {
                    if (r.id === id) return renamedRepository
                    return relinkedById.get(r.id) || r
                }))

                return renamedRepository
            } catch (error) {
                logError(LOG_MESSAGES.ERROR_RENAMING_REPOSITORY_FOLDER, error)
                return REPOSITORY_RESULTS.ERROR
            }
        })
    }, [
        repositories,
        persistRepositories,
        renameDirectory,
        renameVersionsUnder,
        getRootRepository,
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
            return REPOSITORY_RESULTS.ACTIVE
        }

        return withBusy(busyRef, async () => {
            const path = buildRepositoryPaths(repositories).get(id)
            const descendantIds = getDescendants(id).map((d) => d.id)

            await removeRepositoriesFromList([id, ...descendantIds])

            deleteDirectory(repository.uri)
            if (repository.parentId) deleteVersionsUnder(getRootRepository(repository).uri, path)

            return repository
        })
    }, [
        repositories,
        activeRepository,
        isAncestorOf,
        deleteDirectory,
        deleteVersionsUnder,
        getRootRepository,
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
        ensureImagesFolder,
        ensureAttachmentsFolder
    }
}
