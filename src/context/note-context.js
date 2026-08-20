import { createContext, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { useStorage } from '../hooks/use-storage'
import { useFileStorage } from '../hooks/use-file-storage'
import { useRepositories } from '../hooks/use-repositories'
import { loadRepositoryData } from './load-repository-data'
import { DEFAULT_CATEGORIES } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [trash, setTrash] = useState(new Set())
    const [paramId, setParamId] = useState('')
    const [loading, setLoading] = useState(true)

    const storage = useStorage()
    const fileStorage = useFileStorage()
    const { activeRepository } = useRepositories()

    useEffect(() => {
        if (!activeRepository) return

        const getNotes = async (showLoading = true) => {
            if (showLoading) setLoading(true)

            try {
                const { notes, categories, trash } = await loadRepositoryData(activeRepository, storage, fileStorage)

                setNotes(notes)
                setCategories(categories)
                setTrash(new Set(trash))
            } catch (error) {
                console.debug('error loading notes', error)
            } finally {
                if (showLoading) setLoading(false)
            }
        }

        getNotes()

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') getNotes(false)
        })

        return () => subscription.remove()
    }, [activeRepository?.uri])

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
