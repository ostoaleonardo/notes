import { useCallback, useContext, useMemo } from 'react'
import { randomUUID } from 'expo-crypto'
import { Directory } from 'expo-file-system'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { usePro } from './use-pro'
import { useWelcomeNote } from './use-welcome-note'
import { RepositoryContext } from '../context/repository-context'
import { sanitizeFilename } from '@/utils/note-filename'
import { getDefaultTemplates } from '@/utils/default-templates'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { FREE_SUBFOLDERS_PER_REPOSITORY } from '@/constants/default-values'

export function useRepositories() {
    const { setItem } = useStorage()
    const { pro } = usePro()
    const { seedWelcomeNote } = useWelcomeNote()

    const {
        listMarkdownFiles,
        listSubdirectories,
        writeNoteFile,
        createSubdirectory,
        deleteDirectory,
        directoryExists,
        renameDirectory,
        getOrCreateTemplatesFolder,
        getOrCreateImagesFolder
    } = useFileStorage()

    const {
        repositories,
        setRepositories,
        activeRepositoryId,
        setActiveRepositoryId,
        loading,
        reconciled,
        setReconciled,
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

    const seedTemplates = useCallback((templatesUri) => {
        const existingNames = new Set(listMarkdownFiles(templatesUri).map((file) => file.name))
        getDefaultTemplates().forEach(({ filename, content }) => {
            if (!existingNames.has(filename)) writeNoteFile(templatesUri, filename, content)
        })
    }, [listMarkdownFiles, writeNoteFile])

    const buildRepository = useCallback((
        directory,
        parentId = null,
        seedTemplatesFolder = true
    ) => {
        let templatesUri = null

        if (seedTemplatesFolder) {
            const templatesDirectory = getOrCreateTemplatesFolder(directory.uri)
            seedTemplates(templatesDirectory.uri)
            templatesUri = templatesDirectory.uri
        }

        return {
            id: randomUUID(),
            uri: directory.uri,
            alias: directory.name,
            createdAt: Date.now(),
            templatesUri,
            parentId
        }
    }, [getOrCreateTemplatesFolder, seedTemplates])

    const discoverSubfolders = useCallback((directory, parentId) => (
        listSubdirectories(directory.uri).flatMap((subdirectory) => {
            const entry = buildRepository(subdirectory, parentId, false)
            return [entry, ...discoverSubfolders(subdirectory, entry.id)]
        })
    ), [listSubdirectories, buildRepository])

    const addRepository = useCallback(async () => {
        busyRef.current = true

        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) {
                return 'duplicate'
            }

            const repository = buildRepository(directory)
            const discovered = discoverSubfolders(directory, repository.id)
            const welcomeNoteId = await seedWelcomeNote(directory.uri)

            await persistRepositories([...repositories, repository, ...discovered])
            if (!activeRepositoryId) await persistActiveRepository(repository.id)

            return { ...repository, welcomeNoteId }
        } catch (error) {
            console.debug('error picking repository', error)
            return null
        } finally {
            busyRef.current = false
        }
    }, [
        repositories,
        activeRepositoryId,
        buildRepository,
        discoverSubfolders,
        seedWelcomeNote,
        persistRepositories,
        persistActiveRepository,
        busyRef
    ])

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

        busyRef.current = true

        try {
            const directory = createSubdirectory(parent.uri, sanitizeFilename(name))
            const repository = buildRepository(directory, parentId, false)

            await persistRepositories([...repositories, repository])
            return repository
        } finally {
            busyRef.current = false
        }
    }, [
        repositories,
        buildRepository,
        canAddSubfolder,
        createSubdirectory,
        persistRepositories,
        busyRef
    ])

    const getRootRepository = useCallback((repository) => {
        let current = repository

        while (current.parentId) {
            const parent = repositories.find((r) => r.id === current.parentId)
            if (!parent) break
            current = parent
        }

        return current
    }, [repositories])

    const ensureTemplatesFolder = useCallback(async (repository) => {
        const root = getRootRepository(repository)
        if (root.templatesUri) return root.templatesUri

        busyRef.current = true

        try {
            const templatesDirectory = getOrCreateTemplatesFolder(root.uri)
            seedTemplates(templatesDirectory.uri)

            await persistRepositories(repositories.map((r) => (
                r.id === root.id ? { ...r, templatesUri: templatesDirectory.uri } : r
            )))

            return templatesDirectory.uri
        } finally {
            busyRef.current = false
        }
    }, [getRootRepository, getOrCreateTemplatesFolder, seedTemplates, persistRepositories, repositories, busyRef])

    const ensureImagesFolder = useCallback((repository) => {
        const root = getRootRepository(repository)
        return getOrCreateImagesFolder(root.uri).uri
    }, [getRootRepository, getOrCreateImagesFolder])

    const relinkUris = useCallback((repository) => {
        let diskChildren

        try {
            diskChildren = listSubdirectories(repository.uri)
        } catch {
            diskChildren = []
        }

        const trackedChildren = repositories.filter((r) => r.parentId === repository.id)
        const diskByName = new Map(diskChildren.map((d) => [d.name, d]))

        return trackedChildren.flatMap((child) => {
            const disk = diskByName.get(child.alias)
            if (!disk) return []

            const relinkedChild = { ...child, uri: disk.uri }
            return [relinkedChild, ...relinkUris(relinkedChild)]
        })
    }, [listSubdirectories, repositories])

    const renameRepository = useCallback(async (id, alias) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return null

        if (!repository.parentId) {
            await persistRepositories(repositories.map((r) => (r.id === id ? { ...r, alias } : r)))
            return repository
        }

        busyRef.current = true

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
        } finally {
            busyRef.current = false
        }
    }, [
        repositories,
        persistRepositories,
        renameDirectory,
        relinkUris,
        busyRef
    ])

    const isAncestorOf = useCallback((ancestorId, repository) => {
        let current = repository

        while (current) {
            if (current.id === ancestorId) return true
            current = repositories.find((r) => r.id === current.parentId)
        }

        return false
    }, [repositories])

    const removeRepositoriesFromList = useCallback(async (ids) => {
        const idSet = new Set(ids)
        const remaining = repositories.filter((r) => !idSet.has(r.id))
        await persistRepositories(remaining)

        if (idSet.has(activeRepositoryId)) {
            await persistActiveRepository(remaining[0]?.id || '')
        }
    }, [repositories, persistRepositories, activeRepositoryId, persistActiveRepository])

    const buildSubtree = useCallback((parentId, depth = 0) => (
        repositories
            .filter((repository) => (repository.parentId || null) === parentId)
            .flatMap((repository) => [{ ...repository, depth }, ...buildSubtree(repository.id, depth + 1)])
    ), [repositories])

    const getDescendants = useCallback((rootId) => buildSubtree(rootId, 0), [buildSubtree])

    const forgetRepository = useCallback(async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return

        busyRef.current = true

        try {
            const descendantIds = getDescendants(id).map((d) => d.id)
            await removeRepositoriesFromList([id, ...descendantIds])
        } finally {
            busyRef.current = false
        }
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

        busyRef.current = true

        try {
            deleteDirectory(repository.uri)

            const descendantIds = getDescendants(id).map((d) => d.id)
            await removeRepositoriesFromList([id, ...descendantIds])

            return repository
        } finally {
            busyRef.current = false
        }
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

    const reconcileTree = useCallback((repository) => {
        if (!directoryExists(repository.uri)) return []

        let diskSubdirectories

        try {
            diskSubdirectories = listSubdirectories(repository.uri)
        } catch {
            diskSubdirectories = []
        }

        const trackedChildren = repositories.filter((r) => r.parentId === repository.id)
        const diskUris = new Set(diskSubdirectories.map((d) => d.uri))
        const trackedUris = new Set(trackedChildren.map((r) => r.uri))

        const survivingDescendants = trackedChildren
            .filter((child) => diskUris.has(child.uri))
            .flatMap(reconcileTree)

        const newDescendants = diskSubdirectories
            .filter((d) => !trackedUris.has(d.uri))
            .flatMap((d) => {
                const entry = buildRepository(d, repository.id, false)
                return [entry, ...discoverSubfolders(d, entry.id)]
            })

        return [repository, ...survivingDescendants, ...newDescendants]
    }, [
        repositories,
        buildRepository,
        directoryExists,
        listSubdirectories,
        discoverSubfolders
    ])

    const reconcileRepositories = useCallback(async () => {
        if (busyRef.current) return

        const roots = repositories.filter((r) => !r.parentId)
        const reconciled = roots.flatMap(reconcileTree)

        await persistRepositories(reconciled)

        if (activeRepositoryId && !reconciled.some((r) => r.id === activeRepositoryId)) {
            const remainingRoots = reconciled.filter((r) => !r.parentId)
            await persistActiveRepository(remainingRoots[0]?.id || '')
        }
    }, [
        repositories,
        activeRepositoryId,
        reconcileTree,
        persistRepositories,
        persistActiveRepository,
        busyRef
    ])

    const activeRepositoryTree = useMemo(() => {
        if (!activeRepository) return []
        const root = getRootRepository(activeRepository)
        return [{ ...root, depth: 0 }, ...buildSubtree(root.id, 1)]
    }, [
        repositories,
        activeRepository,
        getRootRepository,
        buildSubtree
    ])

    return {
        repositories,
        activeRepositoryTree,
        activeRepository,
        activeRepositoryId,
        loading,
        reconciled,
        setReconciled,
        addRepository,
        addSubfolder,
        renameRepository,
        forgetRepository,
        removeRepository,
        setActiveRepository,
        ensureTemplatesFolder,
        ensureImagesFolder,
        getDescendants,
        buildRepository,
        reconcileRepositories
    }
}
