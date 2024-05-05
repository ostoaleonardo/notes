import { createContext, useState } from 'react'

export const SyncContext = createContext()

export function SyncProvider({ children }) {
    const [lastSync, setLastSync] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)

    return (
        <SyncContext.Provider
            value={{
                lastSync,
                setLastSync,
                isSyncing,
                setIsSyncing
            }}
        >
            {children}
        </SyncContext.Provider>
    )
}
