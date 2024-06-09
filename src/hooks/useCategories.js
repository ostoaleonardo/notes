import { useContext, useEffect } from 'react'
import { NoteContext } from '@/context'
import { useStorage } from './useStorage'
import { useCategoriesBackup } from './useCategoriesBackup'
import { STORAGE_KEYS } from '@/constants'

export function useCategories() {
    const { categories, setCategories } = useContext(NoteContext)
    const { backup, isSyncing } = useCategoriesBackup()
    const { setItem, getItem } = useStorage()

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
        await backup(localCategories)
    }

    useEffect(() => {
        (async () => {
            if (isSyncing) return

            const categories = await getItem(STORAGE_KEYS.CATEGORIES)

            if (categories) {
                setCategories(JSON.parse(categories))
            }
        })()
    }, [])

    return {
        categories,
        getCategory,
        addCategory,
        deleteCategory,
        updateCategory
    }
}
