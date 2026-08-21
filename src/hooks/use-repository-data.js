import { storage } from '@/utils/storage'
import { useFileStorage } from './use-file-storage'
import { loadRepositoryData } from '../context/load-repository-data'

export function useRepositoryData() {
    const fileStorage = useFileStorage()

    return (repository, rootRepository) => loadRepositoryData(repository, rootRepository, storage, fileStorage)
}
