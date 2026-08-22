import { useContext } from 'react'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '@/context'
import { TRASH_METADATA_FILENAME } from '@/constants'
import { getDate, getUniqueFilename } from '@/utils'

export function useTrash() {
    const { trash, setTrash } = useContext(NoteContext)
    const { activeRepository } = useRepositories()
    const {
        getOrCreateTrashFolder,
        listMarkdownFiles,
        writeNoteFile,
        deleteNoteFile,
        readJson,
        writeJson
    } = useFileStorage()

    const getTrashUri = () => getOrCreateTrashFolder(activeRepository.uri).uri

    const addItem = async (item) => {
        const trashUri = getTrashUri()
        const existingNames = listMarkdownFiles(trashUri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, item.title, null)
        const trashedAt = getDate()

        writeNoteFile(trashUri, filename, item.note || '')

        const metadata = await readJson(trashUri, TRASH_METADATA_FILENAME, {})
        metadata[item.id] = {
            filename,
            trashedAt,
            tags: item.tags || [],
            password: item.password || '',
            biometrics: item.biometrics || false,
            createdAt: item.createdAt || trashedAt,
            images: item.images || []
        }
        writeJson(trashUri, TRASH_METADATA_FILENAME, metadata)

        setTrash(prev => {
            const items = new Set(prev)
            items.add({ ...item, trashedAt })
            return items
        })
    }

    const deleteItem = async (item) => {
        const trashUri = getTrashUri()
        const metadata = await readJson(trashUri, TRASH_METADATA_FILENAME, {})
        const entry = metadata[item.id]

        if (entry) {
            deleteNoteFile(trashUri, entry.filename)
            delete metadata[item.id]
            writeJson(trashUri, TRASH_METADATA_FILENAME, metadata)
        }

        setTrash(prev => {
            const items = new Set(prev)
            items.delete(item)
            return items
        })
    }

    const clearAll = () => {
        if (trash.size === 0) return

        const trashUri = getTrashUri()
        listMarkdownFiles(trashUri).forEach((file) => deleteNoteFile(trashUri, file.name))
        writeJson(trashUri, TRASH_METADATA_FILENAME, {})

        setTrash(new Set())
    }

    return {
        trash,
        addItem,
        deleteItem,
        clearAll
    }
}
