import { useContext, useEffect } from 'react'
import { useGoogleDrive } from './useGoogleDrive'
import { useStorage } from './useStorage'
import { NoteContext } from '@/context'

export function useCategories() {
    const { categories, setCategories } = useContext(NoteContext)
    const { isSyncing, uploadBackup } = useGoogleDrive()
    const { setItem, getItem } = useStorage()

    const addCategory = (category) => {
        if (category && !categories.includes(category)) {
            const newCategories = [...categories, category]
            setCategories(newCategories)
            updateBackup(newCategories)
        }
    }

    const removeCategory = (id) => {
        const newCategories = categories.filter((category) => category.id !== id)
        setCategories(newCategories)
        updateBackup(newCategories)
    }

    const updateCategory = (id, newName) => {
        const newCategories = categories.map((category) => {
            if (category.id === id) {
                return {
                    ...category,
                    name: newName
                }
            }
            return category
        })

        setCategories(newCategories)
        updateBackup(newCategories)
    }

    const getCategory = (id) => {
        return categories.find((category) => category.id === id) || {}
    }

    const updateBackup = async (newCategories) => {
        await setItem('categories', JSON.stringify(newCategories))
        await uploadBackup('categoriesFileId', 'categories.json', JSON.stringify(newCategories))
    }

    useEffect(() => {
        (async () => {
            if (isSyncing) return

            const categories = await getItem('categories')

            if (categories) {
                setCategories(JSON.parse(categories))
            }
        })()
    }, [])

    return {
        categories,
        getCategory,
        addCategory,
        removeCategory,
        updateCategory
    }
}
