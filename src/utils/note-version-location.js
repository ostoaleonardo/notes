import { buildRepositoryPaths } from '@/utils/note-path'

export const buildVersionKey = (folderPath, filename) => (
    folderPath ? `${folderPath}/${filename}` : filename
)

export const getVersionLocation = (repositories, repositoryId) => {
    const repository = repositories.find((r) => r.id === repositoryId)
    if (!repository) return null

    let root = repository
    while (root.parentId) {
        const parent = repositories.find((r) => r.id === root.parentId)
        if (!parent) break
        root = parent
    }

    return {
        rootUri: root.uri,
        folderUri: repository.uri,
        folderPath: buildRepositoryPaths(repositories).get(repositoryId) || ''
    }
}
