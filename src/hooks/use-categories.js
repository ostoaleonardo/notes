import { useContext } from 'react'
import { useStorage } from './use-storage'
import { CATEGORIES_FILENAME, useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '@/context'
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '@/constants'

export function useCategories() {
    const { categories, setCategories } = useContext(NoteContext)
    const { writeJson } = useFileStorage()
    const { getItem } = useStorage()
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

    const deleteAllCategories = async () => {
        setCategories(DEFAULT_CATEGORIES)

        const repositoriesJson = await getItem(STORAGE_KEYS.REPOSITORIES)
        const activeRepositoryId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)
        const repositories = repositoriesJson ? JSON.parse(repositoriesJson) : []
        const repository = repositories.find((r) => r.id === activeRepositoryId)

        if (repository) writeJson(repository.uri, CATEGORIES_FILENAME, DEFAULT_CATEGORIES)
    }

    return {
        categories,
        getCategory,
        addCategory,
        deleteCategory,
        updateCategory,
        deleteAllCategories
    }
}
