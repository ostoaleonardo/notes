import { createContext, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { useStorage } from '../hooks/use-storage'
import { useFileStorage } from '../hooks/use-file-storage'
import { useRepositories } from '../hooks/use-repositories'
import { loadRepositoryData } from './load-repository-data'
import { DEFAULT_TAGS } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [tags, setTags] = useState(DEFAULT_TAGS)
    const [trash, setTrash] = useState(new Set())
    const [paramId, setParamId] = useState('')
    const [loading, setLoading] = useState(true)

    const storage = useStorage()
    const fileStorage = useFileStorage()
    const { activeRepository, activeRepositoryTree } = useRepositories()

    useEffect(() => {
        if (!activeRepository) return

        const getNotes = async (showLoading = true) => {
            if (showLoading) setLoading(true)

            try {
                const rootRepository = activeRepositoryTree[0] || activeRepository
                const { notes, tags, trash } = await loadRepositoryData(activeRepository, rootRepository, storage, fileStorage)

                setNotes(notes)
                setTags(tags)
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
        setTags(DEFAULT_TAGS)
    }

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                tags,
                setTags,
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
