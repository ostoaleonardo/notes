import { sortNotes } from './note-sort'

import { DRAWER_ITEM_TYPES } from '@/constants/drawer-views'

export const buildRepositoryTree = (flatList, notesByRepository, sort, parentId = null) => (
    flatList
        .filter((repository) => (repository.parentId || null) === parentId)
        .map((repository) => ({
            repository,
            notes: sortNotes(notesByRepository.get(repository.id) || [], sort),
            subfolders: buildRepositoryTree(flatList, notesByRepository, sort, repository.id)
        }))
)

export const findFolderNode = (tree, folderId) => {
    for (const node of tree) {
        if (node.repository.id === folderId) return node

        const found = findFolderNode(node.subfolders, folderId)
        if (found) return found
    }

    return null
}

export const resolveLevel = (tree, folderId) => findFolderNode(tree, folderId) || tree[0] || null

export const buildLevelRows = ({ repository, notes, subfolders }) => [
    {
        type: DRAWER_ITEM_TYPES.LEVEL,
        id: 'level:' + repository.id,
        repository,
        isRoot: !repository.parentId
    },
    ...subfolders.map((node) => ({
        type: DRAWER_ITEM_TYPES.REPOSITORY,
        id: 'repository:' + node.repository.id,
        repository: node.repository
    })),
    ...notes.map((note) => ({
        type: DRAWER_ITEM_TYPES.NOTE,
        id: 'note:' + note.path,
        note
    }))
]
