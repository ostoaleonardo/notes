import { createContext, useEffect, useMemo, useRef, useState } from 'react'

import { useStorage } from '../hooks/use-storage'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export const RepositoryContext = createContext()

export function RepositoryProvider({ children }) {
    const [repositories, setRepositories] = useState([])
    const [activeRepositoryId, setActiveRepositoryId] = useState('')
    const [loading, setLoading] = useState(true)
    const [reconciled, setReconciled] = useState(false)
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

    const value = useMemo(() => ({
        repositories,
        setRepositories,
        activeRepositoryId,
        setActiveRepositoryId,
        loading,
        reconciled,
        setReconciled,
        busyRef
    }), [repositories, activeRepositoryId, loading, reconciled])

    return (
        <RepositoryContext.Provider value={value}>
            {children}
        </RepositoryContext.Provider>
    )
}
