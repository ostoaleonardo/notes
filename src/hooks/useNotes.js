import { useContext, useEffect, useState } from 'react'
import { useGoogleDrive } from './useGoogleDrive'
import { useStorage } from './useStorage'
import { NoteContext } from '@/context'

export function useNotes() {
    const { notes, setNotes } = useContext(NoteContext)
    const { isSyncing, uploadBackup } = useGoogleDrive()
    const { setItem, getItem } = useStorage()
    const [loading, setLoading] = useState(true)

    const saveNote = (note) => {
        const newNotes = [note, ...notes]
        setNotes(newNotes)
        updateBackup(newNotes)
    }

    const deleteNote = (id) => {
        const newNotes = notes.filter((note) => note.id !== id)
        setNotes(newNotes)
        updateBackup(newNotes)
    }

    const updateNote = (note) => {
        const newNotes = notes.map((n) => {
            if (n.id === note.id) {
                return note
            }
            return n
        })

        setNotes(newNotes)
        updateBackup(newNotes)
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
    }

    const updateBackup = async (newNotes) => {
        await setItem('notes', JSON.stringify(newNotes))
        await uploadBackup('notesFileId', 'notes.json', JSON.stringify(newNotes))
    }

    useEffect(() => {
        (async () => {
            if (isSyncing) return

            const notes = await getItem('notes')

            if (notes) {
                setNotes(JSON.parse(notes))
            }

            setLoading(false)
        })()
    }, [])

    return {
        notes,
        setNotes,
        loading,
        saveNote,
        deleteNote,
        updateNote,
        getNote
    }
}
