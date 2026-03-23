import { useContext, useEffect, useState } from 'react'
import { useStorage } from './use-storage'
import { NoteContext, SyncUtilsContext, UtilsContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useNotes() {
    const { notes, setNotes, paramId, setParamId } = useContext(NoteContext)
    const { setPinned, setSort } = useContext(UtilsContext)
    const { schedule } = useContext(SyncUtilsContext)

    const [loading, setLoading] = useState(true)
    const { setItem, getItem } = useStorage()

    const saveNote = (note) => {
        const localNotes = [note, ...notes]
        saveLocal(localNotes)
        schedule('create', note.id)
    }

    const deleteNote = (id) => {
        const localNotes = notes.filter((note) => note.id !== id)
        saveLocal(localNotes)
        schedule('delete', id)
    }

    const updateNote = (note) => {
        const localNotes = notes.map((n) => {
            if (n.id === note.id) return note
            return n
        })

        saveLocal(localNotes)
        schedule('update', note.id)
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
    }

    const saveLocal = async (localNotes) => {
        setNotes(localNotes)
        await setItem(STORAGE_KEYS.NOTES, JSON.stringify(localNotes))
    }

    useEffect(() => {
        const getNotes = async () => {
            try {
                if (notes.length === 0) {
                    const notes = await getItem(STORAGE_KEYS.NOTES)
                    const pinned = await getItem(STORAGE_KEYS.PINNED)
                    const sort = await getItem(STORAGE_KEYS.SORT)

                    if (notes) setNotes(JSON.parse(notes))
                    if (pinned) setPinned(new Set(JSON.parse(pinned)))
                    if (sort) setSort(JSON.parse(sort))
                }
            } catch (error) {
                console.error('Error loading notes:', error)
            } finally {
                setLoading(false)
            }
        }

        getNotes()
    }, [])

    return {
        notes,
        getNote,
        saveNote,
        deleteNote,
        updateNote,
        paramId,
        setParamId,
        loading,
        saveNotesDebug
    }
}
