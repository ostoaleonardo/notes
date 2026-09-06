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

export const flattenDrawerTree = (tree, collapsedFolders, depth = 0) => (
    tree.flatMap(({ repository, notes, subfolders }) => {
        const isCollapsed = collapsedFolders.has(repository.id)
        const row = { type: 'repository', id: 'repository:' + repository.id, repository, depth, isCollapsed }

        if (isCollapsed) return [row]

        const noteRows = notes.map((note) => ({ type: 'note', id: 'note:' + note.id, note, depth: depth + 1 }))
        const subfolderRows = flattenDrawerTree(subfolders, collapsedFolders, depth + 1)

        return [row, ...noteRows, ...subfolderRows]
    })
)
