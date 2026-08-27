export const buildRepositoryTree = (flatList, notesByRepository, parentId = null) => (
    flatList
        .filter((repository) => (repository.parentId || null) === parentId)
        .map((repository) => ({
            repository,
            notes: (notesByRepository.get(repository.id) || []).slice()
                .sort((a, b) => a.title.localeCompare(b.title)),
            subfolders: buildRepositoryTree(flatList, notesByRepository, repository.id)
        }))
)
