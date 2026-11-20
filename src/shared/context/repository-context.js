import { createContext } from 'react'

import { RepositoryStateProvider } from './repository-state-context'
import { useRepositoryController } from '@/shared/hooks/use-repository-controller'

export const RepositoryContext = createContext()

const RepositoryApiProvider = ({ children }) => {
    const folders = useRepositoryController()

    return (
        <RepositoryContext.Provider value={folders}>
            {children}
        </RepositoryContext.Provider>
    )
}

export const RepositoryProvider = ({ children }) => (
    <RepositoryStateProvider>
        <RepositoryApiProvider>
            {children}
        </RepositoryApiProvider>
    </RepositoryStateProvider>
)
