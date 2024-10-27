import { useContext, useEffect, useState } from 'react'
import { useStorage } from './useStorage'
import { NoteContext, UtilsContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useNotes() {
    const { notes, setNotes } = useContext(NoteContext)
    const { setPinned, setSort } = useContext(UtilsContext)
    const { setItem, getItem } = useStorage()
    const [loading, setLoading] = useState(true)

    const saveNote = (note) => {
        const localNotes = [note, ...notes]
        updateBackup(localNotes)
    }

    const deleteNote = (id) => {
        const localNotes = notes.filter((note) => note.id !== id)
        updateBackup(localNotes)
    }

    const updateNote = (note) => {
        const localNotes = notes.map((n) => {
            if (n.id === note.id) return note
            return n
        })

        updateBackup(localNotes)
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
    }

    const updateBackup = async (localNotes) => {
        setNotes(localNotes)
        await setItem(STORAGE_KEYS.NOTES, JSON.stringify(localNotes))
    }

    useEffect(() => {
        (async () => {
            const notes = await getItem(STORAGE_KEYS.NOTES)
            const pinned = await getItem(STORAGE_KEYS.PINNED)
            const sort = await getItem(STORAGE_KEYS.SORT)

            if (notes) setNotes(JSON.parse(notes))
            if (pinned) setPinned(new Set(JSON.parse(pinned)))
            if (sort) setSort(JSON.parse(sort))
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
