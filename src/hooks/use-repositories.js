import { useContext, useMemo } from 'react'
import { randomUUID } from 'expo-crypto'
import { Directory } from 'expo-file-system'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { usePremium } from './use-premium'
import { RepositoryContext } from '../context/repository-context'
import { STORAGE_KEYS, getDefaultTemplates } from '@/constants'
import { sanitizeFilename } from '@/utils'

const FREE_SUBFOLDERS_PER_REPOSITORY = 1

export function useRepositories() {
    const { setItem } = useStorage()
    const { premium } = usePremium()
    const {
        listMarkdownFiles,
        listSubdirectories,
        writeNoteFile,
        createSubdirectory,
        deleteDirectory,
        getOrCreateTemplatesFolder
    } = useFileStorage()

    const {
        repositories,
        setRepositories,
        activeRepositoryId,
        setActiveRepositoryId,
        loading
    } = useContext(RepositoryContext)

    const activeRepository = repositories.find((repository) => repository.id === activeRepositoryId) || null

    const persistRepositories = async (localRepositories) => {
        setRepositories(localRepositories)
        await setItem(STORAGE_KEYS.REPOSITORIES, JSON.stringify(localRepositories))
    }

    const persistActiveRepository = async (id) => {
        setActiveRepositoryId(id)
        await setItem(STORAGE_KEYS.ACTIVE_REPOSITORY, id)
    }

    const seedTemplates = (templatesUri) => {
        const existingNames = new Set(listMarkdownFiles(templatesUri).map((file) => file.name))
        getDefaultTemplates().forEach(({ filename, content }) => {
            if (!existingNames.has(filename)) writeNoteFile(templatesUri, filename, content)
        })
    }

    const buildRepository = (directory, parentId = null, seedTemplatesFolder = true) => {
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
    }

    const discoverSubfolders = (directory, parentId) => (
        listSubdirectories(directory.uri).flatMap((subdirectory) => {
            const entry = buildRepository(subdirectory, parentId, false)
            return [entry, ...discoverSubfolders(subdirectory, entry.id)]
        })
    )

    const addRepository = async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) {
                return 'duplicate'
            }

            const repository = buildRepository(directory)
            const discovered = discoverSubfolders(directory, repository.id)

            await persistRepositories([...repositories, repository, ...discovered])
            if (!activeRepositoryId) await persistActiveRepository(repository.id)

            return repository
        } catch (error) {
            console.debug('error picking repository', error)
            return null
        }
    }

    const canAddSubfolder = (parentId) => {
        if (premium) return true

        const parent = repositories.find((repository) => repository.id === parentId)
        if (!parent) return false
        if (parent.parentId) return false

        const siblingCount = repositories.filter((repository) => repository.parentId === parentId).length
        return siblingCount < FREE_SUBFOLDERS_PER_REPOSITORY
    }

    const addSubfolder = async (parentId, name) => {
        if (!canAddSubfolder(parentId)) return 'pro_required'

        const parent = repositories.find((repository) => repository.id === parentId)
        if (!parent) return null

        const directory = createSubdirectory(parent.uri, sanitizeFilename(name))
        const repository = buildRepository(directory, parentId, false)

        await persistRepositories([...repositories, repository])
        return repository
    }

    const getRootRepository = (repository) => {
        let current = repository

        while (current.parentId) {
            const parent = repositories.find((r) => r.id === current.parentId)
            if (!parent) break
            current = parent
        }

        return current
    }

    const ensureTemplatesFolder = async (repository) => {
        const root = getRootRepository(repository)
        if (root.templatesUri) return root.templatesUri

        const templatesDirectory = getOrCreateTemplatesFolder(root.uri)
        seedTemplates(templatesDirectory.uri)

        await persistRepositories(repositories.map((r) => (
            r.id === root.id ? { ...r, templatesUri: templatesDirectory.uri } : r
        )))

        return templatesDirectory.uri
    }

    const renameRepository = (id, alias) => {
        persistRepositories(repositories.map((repository) => (
            repository.id === id ? { ...repository, alias } : repository
        )))
    }

    const isAncestorOf = (ancestorId, repository) => {
        let current = repository

        while (current) {
            if (current.id === ancestorId) return true
            current = repositories.find((r) => r.id === current.parentId)
        }

        return false
    }

    const removeRepositoriesFromList = async (ids) => {
        const idSet = new Set(ids)
        const remaining = repositories.filter((r) => !idSet.has(r.id))
        await persistRepositories(remaining)

        if (idSet.has(activeRepositoryId)) {
            await persistActiveRepository(remaining[0]?.id || '')
        }
    }

    const forgetRepository = async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return

        const descendantIds = getDescendants(id).map((d) => d.id)
        await removeRepositoriesFromList([id, ...descendantIds])
    }

    const removeRepository = async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return null

        if (activeRepository && isAncestorOf(id, activeRepository)) {
            return 'active'
        }

        deleteDirectory(repository.uri)

        const descendantIds = getDescendants(id).map((d) => d.id)
        await removeRepositoriesFromList([id, ...descendantIds])

        return repository
    }

    const setActiveRepository = (id) => {
        persistActiveRepository(id)
    }

    const buildSubtree = (parentId, depth = 0) => (
        repositories
            .filter((repository) => (repository.parentId || null) === parentId)
            .flatMap((repository) => [{ ...repository, depth }, ...buildSubtree(repository.id, depth + 1)])
    )

    const activeRepositoryTree = useMemo(() => {
        if (!activeRepository) return []
        const root = getRootRepository(activeRepository)
        return [{ ...root, depth: 0 }, ...buildSubtree(root.id, 1)]
    }, [repositories, activeRepository])

    const getDescendants = (rootId) => buildSubtree(rootId, 0)

    return {
        repositories,
        activeRepositoryTree,
        activeRepository,
        activeRepositoryId,
        loading,
        addRepository,
        addSubfolder,
        renameRepository,
        forgetRepository,
        removeRepository,
        setActiveRepository,
        ensureTemplatesFolder,
        getDescendants
    }
}
