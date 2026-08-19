import { createContext, useEffect, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { STORAGE_KEYS } from '@/constants'

export const RepositoryContext = createContext()

export function RepositoryProvider({ children }) {
    const [repositories, setRepositories] = useState([])
    const [activeRepositoryId, setActiveRepositoryId] = useState('')
    const [loading, setLoading] = useState(true)

    const { getItem } = useStorage()

    useEffect(() => {
        const getRepositories = async () => {
            try {
                const repositories = await getItem(STORAGE_KEYS.REPOSITORIES)
                const activeRepositoryId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)

                if (repositories) setRepositories(JSON.parse(repositories))
                if (activeRepositoryId) setActiveRepositoryId(activeRepositoryId)
            } catch (error) {
                console.error('Error loading repositories:', error)
            } finally {
                setLoading(false)
            }
        }

        getRepositories()
    }, [])

    return (
        <RepositoryContext.Provider
            value={{
                repositories,
                setRepositories,
                activeRepositoryId,
                setActiveRepositoryId,
                loading
            }}
        >
            {children}
        </RepositoryContext.Provider>
    )
}
