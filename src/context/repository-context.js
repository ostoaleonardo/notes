import { createContext, useEffect, useRef, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { STORAGE_KEYS } from '@/constants'

export const RepositoryContext = createContext()

export function RepositoryProvider({ children }) {
    const [repositories, setRepositories] = useState([])
    const [activeRepositoryId, setActiveRepositoryId] = useState('')
    const [loading, setLoading] = useState(true)
    // Shared across every useRepositories() caller: a folder picker backgrounds and
    // re-foregrounds the app, which would otherwise let the foreground reconciliation
    // race an in-flight mutation and clobber it with a stale repositories snapshot.
    const busyRef = useRef(false)

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
                loading,
                busyRef
            }}
        >
            {children}
        </RepositoryContext.Provider>
    )
}
