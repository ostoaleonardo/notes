import { useContext } from 'react'
import { randomUUID } from 'expo-crypto'
import { Directory } from 'expo-file-system'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { RepositoryContext } from '../context/repository-context'
import { STORAGE_KEYS } from '@/constants'

export function useRepositories() {
    const { setItem } = useStorage()
    const { clearFolder } = useFileStorage()

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

    const addRepository = async () => {
        try {
            const directory = await Directory.pickDirectoryAsync()

            if (repositories.some((repository) => repository.uri === directory.uri)) {
                return 'duplicate'
            }

            const repository = {
                id: randomUUID(),
                uri: directory.uri,
                alias: directory.name,
                createdAt: Date.now()
            }

            await persistRepositories([...repositories, repository])
            if (!activeRepositoryId) await persistActiveRepository(repository.id)

            return repository
        } catch (error) {
            console.debug('error picking repository', error)
            return null
        }
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

        clearFolder(repository.uri)
        await removeRepositoryFromList(id)
    }

    const setActiveRepository = (id) => {
        persistActiveRepository(id)
    }

    return {
        repositories,
        activeRepository,
        activeRepositoryId,
        loading,
        addRepository,
        renameRepository,
        forgetRepository,
        removeRepository,
        setActiveRepository
    }
}
