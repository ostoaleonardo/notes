import { createContext, useState } from 'react'

export const SyncContext = createContext()

export function SyncProvider({ children }) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isBackingUp, setIsBackingUp] = useState(false)

    return (
        <SyncContext.Provider
            value={{
                isSyncing,
                setIsSyncing,
                isBackingUp,
                setIsBackingUp
            }}
        >
            {children}
        </SyncContext.Provider>
    )
}
