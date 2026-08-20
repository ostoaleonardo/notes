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
        clearRepository,
        listMarkdownFiles,
        writeNoteFile,
        createSubdirectory,
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

    const addRepository = async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) {
                return 'duplicate'
            }

            const repository = buildRepository(directory)

            await persistRepositories([...repositories, repository])
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

    const removeRepositoryFromList = async (id) => {
        const remaining = repositories.filter((r) => r.id !== id)
        await persistRepositories(remaining)

        if (activeRepositoryId === id) {
            await persistActiveRepository(remaining[0]?.id || '')
        }
    }

    const forgetRepository = async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return

        await removeRepositoryFromList(id)
    }

    const removeRepository = async (id) => {
        const repository = repositories.find((r) => r.id === id)
        if (!repository) return

        clearRepository(repository.uri)
        await removeRepositoryFromList(id)
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
