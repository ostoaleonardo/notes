import { useContext, useEffect, useState } from 'react'
import { useNotesBackup } from './useNotesBackup'
import { useStorage } from './useStorage'
import { NoteContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useNotes() {
    const { notes, setNotes } = useContext(NoteContext)
    const { backup, isSyncing } = useNotesBackup()
    const { setItem, getItem } = useStorage()
    const [loading, setLoading] = useState(true)

    const saveNote = (note) => {
        const localNotes = [note, ...notes]
        updateBackup(localNotes, note, 'create')
    }

    const deleteNote = (id) => {
        const localNotes = notes.filter((note) => note.id !== id)
        updateBackup(localNotes, { id }, 'delete')
    }

    const updateNote = (note) => {
        const localNotes = notes.map((n) => {
            if (n.id === note.id) return note
            return n
        })

        updateBackup(localNotes, note, 'update')
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
    }

    const updateBackup = async (localNotes, note, action) => {
        setNotes(localNotes)
        await setItem(STORAGE_KEYS.NOTES, JSON.stringify(localNotes))
        await backup(action, note)
    }

    useEffect(() => {
        (async () => {
            if (isSyncing) return

            const notes = await getItem(STORAGE_KEYS.NOTES)

            if (notes) {
                setNotes(JSON.parse(notes))
            }

            setLoading(false)
        })()
    }, [])

    return {
        notes,
        getNote,
        saveNote,
        deleteNote,
        updateNote,
        loading
    }
}
