import { useContext } from 'react'
import { useStorage } from './use-storage'
import { NoteContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useCategories() {
    const { categories, setCategories } = useContext(NoteContext)

    const { setItem } = useStorage()

    const addCategory = (category) => {
        if (category && !categories.includes(category)) {
            const localCategories = [...categories, category]
            updateBackup(localCategories)
        }
    }

    const deleteCategory = (id) => {
        const localCategories = categories.filter((category) => category.id !== id)
        updateBackup(localCategories)
    }

    const updateCategory = (category) => {
        const localCategories = categories.map((c) => {
            if (c.id === category.id) return category
            return c
        })

        updateBackup(localCategories)
    }

    const getCategory = (id) => {
        return categories.find((category) => category.id === id) || {}
    }

    const updateBackup = async (localCategories) => {
        setCategories(localCategories)
        await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(localCategories))
    }

    return {
        categories,
        getCategory,
        addCategory,
        deleteCategory,
        updateCategory
    }
}
