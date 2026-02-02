import { useContext, useEffect, useState } from 'react'
import { useStorage } from './useStorage'
import { NoteContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useTrash() {
    const { trash, setTrash } = useContext(NoteContext)
    const { setItem, getItem } = useStorage()

    const [loading, setLoading] = useState(true)

    const addItem = (item) => {
        setTrash(prev => {
            const items = new Set(prev)
            items.add(item)
            updateTrash(items)
            return items
        })

        updateTrash(trash)
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

    const updateTrash = async (trash) => {
        const array = [...trash]
        await setItem(STORAGE_KEYS.TRASH, JSON.stringify(array))
    }

    useEffect(() => {
        const getTrash = async () => {
            try {
                const data = await getItem(STORAGE_KEYS.TRASH)

                if (data) {
                    const parsed = JSON.parse(data)
                    const array = Array.isArray(parsed) ? parsed
                        : Object.values(parsed)

                    setTrash(new Set(array))
                }
            } catch (error) {
                console.error('Error loading trash:', error)
            } finally {
                setLoading(false)
            }
        }

        getTrash()
    }, [])

    return {
        trash,
        addItem,
        deleteItem,
        clearAll,
        loading
    }
}
