import { useContext } from 'react'
import { TRASH_FILENAME, useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '@/context'

export function useTrash() {
    const { trash, setTrash } = useContext(NoteContext)
    const { writeJson } = useFileStorage()
    const { activeRepository } = useRepositories()

    const addItem = (item) => {
        setTrash(prev => {
            const items = new Set(prev)
            items.add(item)
            updateTrash(items)
            return items
        })
    }

    const deleteItem = (item) => {
        setTrash(prev => {
            const items = new Set(prev)
            items.delete(item)
            updateTrash(items)
            return items
        })

    }

    const clearAll = () => {
        if (trash.size === 0) return

        setTrash(() => {
            const items = new Set()
            updateTrash(items)
            return items
        })
    }

    const updateTrash = (trash) => {
        const array = [...trash]
        writeJson(activeRepository.uri, TRASH_FILENAME, array)
    }

    return {
        trash,
        addItem,
        deleteItem,
        clearAll
    }
}
