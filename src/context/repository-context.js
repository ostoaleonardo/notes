import { createContext, useEffect, useMemo, useRef, useState } from 'react'

import { useStorage } from '@/hooks/use-storage'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

export const RepositoryContext = createContext()

export function RepositoryProvider({ children }) {
    const [loading, setLoading] = useState(true)
    const [reconciled, setReconciled] = useState(false)
    const [repositories, setRepositories] = useState([])
    const [activeRepositoryId, setActiveRepositoryId] = useState('')
    const [pendingWelcomeNoteId, setPendingWelcomeNoteId] = useState(null)

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
                logError(LOG_MESSAGES.ERROR_LOADING_REPOSITORIES, error)
            } finally {
                setLoading(false)
            }
        }

        getRepositories()
    }, [getItem])

    const value = useMemo(() => ({
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
    }), [
        loading,
        reconciled,
        repositories,
        activeRepositoryId,
        pendingWelcomeNoteId
    ])

    return (
        <RepositoryContext.Provider value={value}>
            {children}
        </RepositoryContext.Provider>
    )
}
