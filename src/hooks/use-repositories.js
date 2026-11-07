import { useContext } from 'react'

import { RepositoryContext } from '@/context/repository-context'

export function useRepositories() {
    return useContext(RepositoryContext)
}
