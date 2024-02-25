import { useContext, useEffect } from 'react'
import { NoteContext } from '../context/NoteContext'
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

    const removeCategory = (category) => {
        const newCategories = categories.filter((c) => c !== category)
        setCategories(newCategories)
        AsyncStorage.setItem('categories', JSON.stringify(newCategories))
    }

    return {
        categories,
        addCategory,
        removeCategory,
    }
}
