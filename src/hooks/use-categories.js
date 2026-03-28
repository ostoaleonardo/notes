import { useContext } from 'react'
import { useStorage } from './use-storage'
import { useCategoriesBackup } from './use-categories-backup'
import { AuthContext, NoteContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useCategories() {
    const { accessToken } = useContext(AuthContext)
    const { categories, setCategories } = useContext(NoteContext)

    const { setItem } = useStorage()
    const { backup } = useCategoriesBackup(accessToken)

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
        await backup(localCategories)
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
