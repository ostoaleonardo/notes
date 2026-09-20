export const buildRepositoryPaths = (repositories) => {
    const byId = new Map(repositories.map((repository) => [repository.id, repository]))
    const cache = new Map()

    const resolve = (id) => {
        if (cache.has(id)) return cache.get(id)

        const repository = byId.get(id)
        if (!repository || !repository.parentId) {
            cache.set(id, '')
            return ''
        }

        const parentPath = resolve(repository.parentId)
        const path = parentPath ? `${parentPath}/${repository.alias}` : repository.alias

        cache.set(id, path)
        return path
    }

    repositories.forEach((repository) => resolve(repository.id))
    return cache
}

export const getNotePaths = (notes, repositories) => {
    const repositoryPaths = buildRepositoryPaths(repositories)
    return new Map(notes.map((note) => [note.id, repositoryPaths.get(note.repositoryId) || '']))
}
