import { useContext } from 'react'

import { RepositoryContext } from '@/shared/context/repository-context'

export function useRepositories() {
    return useContext(RepositoryContext)
}
