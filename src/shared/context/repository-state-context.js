import { createContext, useEffect, useMemo, useRef, useState } from 'react'

import { useStorage } from '@/shared/hooks/use-storage'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'

export const RepositoryStateContext = createContext()

export const RepositoryStateProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [folders, setFolders] = useState([])
    const [activeFolderId, setActiveFolderId] = useState('')
    const [pendingWelcomeNoteId, setPendingWelcomeNoteId] = useState(null)

    const busyRef = useRef(false)
    const { getItem } = useStorage()

    useEffect(() => {
        const getRepositories = async () => {
            try {
                const folders = await getItem(STORAGE_KEYS.REPOSITORIES)
                const activeFolderId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)

                if (folders) setFolders(JSON.parse(folders))
                if (activeFolderId) setActiveFolderId(activeFolderId)
            } catch (error) {
                logError(LOG_MESSAGES.ERROR_LOADING_REPOSITORIES, error)
            } finally {
                setLoading(false)
            }
        }

        getRepositories()
    }, [getItem])

    const value = useMemo(() => ({
        folders,
        setFolders,
        activeFolderId,
        setActiveFolderId,
        loading,
        pendingWelcomeNoteId,
        setPendingWelcomeNoteId,
        busyRef
    }), [
        loading,
        folders,
        activeFolderId,
        pendingWelcomeNoteId
    ])

    return (
        <RepositoryStateContext.Provider value={value}>
            {children}
        </RepositoryStateContext.Provider>
    )
}
