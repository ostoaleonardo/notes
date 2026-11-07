import { createContext } from 'react'

import { RepositoryStateProvider } from './repository-state-context'
import { useRepositoryController } from '@/hooks/use-repository-controller'

export const RepositoryContext = createContext()

const RepositoryApiProvider = ({ children }) => {
    const repositories = useRepositoryController()

    return (
        <RepositoryContext.Provider value={repositories}>
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
