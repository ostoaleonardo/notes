import { sortNotes } from '@/shared/utils/note-sort'

import { DRAWER_ITEM_TYPES } from '@/shared/constants/drawer-views'

const createNode = (folder, notes, sort, subfolders) => {
    let sorted = null

    return {
        folder,
        subfolders,
        get notes() {
            sorted ??= sortNotes(notes, sort)
            return sorted
        }
    }
}

export const buildFolderTree = (flatList, notesByRepository, sort, parentId = null) => (
    flatList
        .filter((folder) => (folder.parentId || null) === parentId)
        .map((folder) => createNode(
            folder,
            notesByRepository.get(folder.id) || [],
            sort,
            buildFolderTree(flatList, notesByRepository, sort, folder.id)
        ))
)

export const findFolderNode = (tree, folderId) => {
    for (const node of tree) {
        if (node.folder.id === folderId) return node

        const found = findFolderNode(node.subfolders, folderId)
        if (found) return found
    }

    return null
}

export const resolveLevel = (tree, folderId) => findFolderNode(tree, folderId) || tree[0] || null

export const buildLevelRows = ({ folder, notes, subfolders }) => [
    ...(folder.parentId ? [{
        type: DRAWER_ITEM_TYPES.LEVEL,
        id: 'level:' + folder.id,
        folder
    }] : []),
    ...subfolders.map((node) => ({
        type: DRAWER_ITEM_TYPES.REPOSITORY,
        id: 'folder:' + node.folder.id,
        folder: node.folder
    })),
    ...notes.map((note) => ({
        type: DRAWER_ITEM_TYPES.NOTE,
        id: 'note:' + note.path,
        note
    }))
]
