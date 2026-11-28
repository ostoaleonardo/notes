import { NOTE_PATH_SEPARATOR } from '@/shared/constants/file-storage'

export const buildNotePath = (folderId, filename) => `${folderId}${NOTE_PATH_SEPARATOR}${filename}`

export const buildFolderPathById = (folders) => {
    const byId = new Map(folders.map((folder) => [folder.id, folder]))
    const cache = new Map()

    const resolve = (id) => {
        if (cache.has(id)) return cache.get(id)

        const folder = byId.get(id)
        if (!folder || !folder.parentId) {
            cache.set(id, '')
            return ''
        }

        const parentPath = resolve(folder.parentId)
        const path = parentPath ? `${parentPath}/${folder.alias}` : folder.alias

        cache.set(id, path)
        return path
    }

    folders.forEach((folder) => resolve(folder.id))
    return cache
}

export const getFolderPathByNote = (notes, folders) => {
    const folderPathById = buildFolderPathById(folders)
    return new Map(notes.map((note) => [note.path, folderPathById.get(note.folderId) || '']))
}
