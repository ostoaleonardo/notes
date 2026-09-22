import { useFileStorage } from './use-file-storage'
import { loadRepositoryData } from '../utils/load-repository-data'
import { storage } from '@/utils/storage'

export function useRepositoryData() {
    const fileStorage = useFileStorage()

    return (tree, rootRepository) => loadRepositoryData(tree, rootRepository, storage, fileStorage)
}
