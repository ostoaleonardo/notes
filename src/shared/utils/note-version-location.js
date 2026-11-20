import { buildFolderPaths } from '@/shared/utils/note-path'

export const buildVersionKey = (folderPath, filename) => (
    folderPath ? `${folderPath}/${filename}` : filename
)

export const getVersionLocation = (folders, folderId) => {
    const folder = folders.find((r) => r.id === folderId)
    if (!folder) return null

    let root = folder
    while (root.parentId) {
        const parent = folders.find((r) => r.id === root.parentId)
        if (!parent) break
        root = parent
    }

    return {
        rootUri: root.uri,
        folderUri: folder.uri,
        folderPath: buildFolderPaths(folders).get(folderId) || ''
    }
}
