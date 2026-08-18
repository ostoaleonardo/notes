import { createContext, useEffect, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '@/constants'
import { getNoteKey, NOTE_KEY_PREFIX } from '@/utils'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [trash, setTrash] = useState(new Set())
    const [paramId, setParamId] = useState('')
    const [loading, setLoading] = useState(true)

    const { getItem, removeItem, getAllKeys, multiGet, multiSet } = useStorage()

    useEffect(() => {
        const migrateLegacyNotes = async () => {
            const legacy = await getItem(STORAGE_KEYS.NOTES)
            if (!legacy) return

            const legacyNotes = JSON.parse(legacy)
            await multiSet(legacyNotes.map((note) => [getNoteKey(note.id), JSON.stringify(note)]))
            await removeItem(STORAGE_KEYS.NOTES)
        }

        const getNotes = async () => {
            try {
                await migrateLegacyNotes()

                const keys = await getAllKeys()
                const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
                const entries = await multiGet(noteKeys)
                const notes = entries.map(([, value]) => JSON.parse(value))

                const categories = await getItem(STORAGE_KEYS.CATEGORIES)
                const trash = await getItem(STORAGE_KEYS.TRASH)

                setNotes(notes)
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
