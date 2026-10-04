import { sortNotes } from './note-sort'

export const buildRepositoryTree = (flatList, notesByRepository, sort, parentId = null) => (
    flatList
        .filter((repository) => (repository.parentId || null) === parentId)
        .map((repository) => ({
            repository,
            notes: sortNotes(notesByRepository.get(repository.id) || [], sort),
            subfolders: buildRepositoryTree(flatList, notesByRepository, sort, repository.id)
        }))
)

export const flattenDrawerTree = (tree, collapsedFolders, depth = 0) => (
    tree.flatMap(({ repository, notes, subfolders }) => {
        const isCollapsed = collapsedFolders.has(repository.id)
        const row = { type: 'repository', id: 'repository:' + repository.id, repository, depth, isCollapsed }

        if (isCollapsed) return [row]

        const noteRows = notes.map((note) => ({ type: 'note', id: 'note:' + note.path, note, depth: depth + 1 }))
        const subfolderRows = flattenDrawerTree(subfolders, collapsedFolders, depth + 1)

        return [row, ...noteRows, ...subfolderRows]
    })
)
