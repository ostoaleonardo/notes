import { createContext, useEffect, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [trash, setTrash] = useState(new Set())
    const [paramId, setParamId] = useState('')
    const [loading, setLoading] = useState(true)

    const { getItem } = useStorage()

    useEffect(() => {
        const getNotes = async () => {
            try {
                const notes = await getItem(STORAGE_KEYS.NOTES)
                const categories = await getItem(STORAGE_KEYS.CATEGORIES)
                const trash = await getItem(STORAGE_KEYS.TRASH)

                if (notes) setNotes(JSON.parse(notes))
                if (categories) setCategories(JSON.parse(categories))

                if (trash) {
                    const parsed = JSON.parse(trash)
                    const array = Array.isArray(parsed) ? parsed : Object.values(parsed)

                    setTrash(new Set(array))
                }
            } catch (error) {
                console.error('Error loading notes:', error)
            } finally {
                setLoading(false)
            }
        }

        getNotes()
    }, [])

    const clear = () => {
        setNotes([])
        setTrash(new Set())
        setCategories(DEFAULT_CATEGORIES)
    }

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                categories,
                setCategories,
                trash,
                setTrash,
                paramId,
                setParamId,
                loading,
                clear
            }}
        >
            {children}
        </NoteContext.Provider>
    )
}
