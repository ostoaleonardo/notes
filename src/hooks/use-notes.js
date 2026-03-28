import { useContext } from 'react'
import { useStorage } from './use-storage'
import { NoteContext, SyncUtilsContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useNotes() {
    const { setItem } = useStorage()

    const {
        notes,
        setNotes,
        paramId,
        setParamId,
        loading
    } = useContext(NoteContext)

    const { schedule } = useContext(SyncUtilsContext)

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

    return {
        notes,
        getNote,
        saveNote,
        deleteNote,
        updateNote,
        paramId,
        setParamId,
        loading
    }
}
