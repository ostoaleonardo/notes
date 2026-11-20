import { useContext } from 'react'

import { RepositoryContext } from '@/shared/context/repository-context'

export function useFolders() {
    return useContext(RepositoryContext)
}
