import { useContext, useEffect } from 'react'
import { NoteContext } from '@/context'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useCategories() {
    const { categories, setCategories } = useContext(NoteContext)

    useEffect(() => {
        AsyncStorage.getItem('categories')
            .then((data) => {
                if (data) {
                    setCategories(JSON.parse(data))
                }
            })
    }, [])

    const addCategory = (category) => {
        if (category && !categories.includes(category)) {
            const newCategories = [...categories, category]
            setCategories(newCategories)
            AsyncStorage.setItem('categories', JSON.stringify(newCategories))
        }
    }

    const removeCategory = (id) => {
        const newCategories = categories.filter((category) => category.id !== id)
        setCategories(newCategories)
        AsyncStorage.setItem('categories', JSON.stringify(newCategories))
    }

    const updateCategory = (id, newName) => {
        const newCategories = categories.map((category) => (
            category.id === id
                ? {
                    ...category,
                    name: newName
                } : category
        ))
        setCategories(newCategories)
        AsyncStorage.setItem('categories', JSON.stringify(newCategories))
    }

    const getCategory = (id) => {
        return categories.find((category) => category.id === id) || {}
    }

    return {
        categories,
        getCategory,
        addCategory,
        removeCategory,
        updateCategory
    }
}
