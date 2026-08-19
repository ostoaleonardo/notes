import { useContext } from 'react'
import { CATEGORIES_FILENAME, useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '@/context'

export function useCategories() {
    const { categories, setCategories } = useContext(NoteContext)
    const { writeJson } = useFileStorage()
    const { activeRepository } = useRepositories()

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

    const updateBackup = (localCategories) => {
        setCategories(localCategories)
        writeJson(activeRepository.uri, CATEGORIES_FILENAME, localCategories)
    }

    return {
        categories,
        getCategory,
        addCategory,
        deleteCategory,
        updateCategory
    }
}
