import { useContext } from 'react'
import { useStorage } from './use-storage'
import { NoteContext } from '../context/note-context'
import { getNoteKey, NOTE_KEY_PREFIX } from '@/utils'

export function useNotes() {
    const { setItem, removeItem, getAllKeys, multiRemove } = useStorage()

    const {
        notes,
        setNotes,
        paramId,
        setParamId,
        loading
    } = useContext(NoteContext)

    const saveNote = (note) => {
        setNotes([note, ...notes])
        setItem(getNoteKey(note.id), JSON.stringify(note))
    }

    const deleteNote = (id) => {
        setNotes(notes.filter((note) => note.id !== id))
        removeItem(getNoteKey(id))
    }

    const updateNote = (note) => {
        setNotes(notes.map((n) => {
            if (n.id === note.id) return note
            return n
        }))

        setItem(getNoteKey(note.id), JSON.stringify(note))
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
    }

    const deleteAll = async () => {
        setNotes([])

        const keys = await getAllKeys()
        const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
        multiRemove(noteKeys)
    }

    return {
        notes,
        getNote,
        saveNote,
        deleteNote,
        deleteAll,
        updateNote,
        paramId,
        setParamId,
        loading
    }
}
