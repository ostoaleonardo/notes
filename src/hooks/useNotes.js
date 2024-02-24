import { useContext, useEffect, useState } from 'react'
import { NoteContext } from '../context/NoteContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useNotes() {
    const { notes, setNotes } = useContext(NoteContext)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        AsyncStorage.getItem('notes')
            .then((data) => {
                if (data) {
                    setNotes(JSON.parse(data))
                }
                setLoading(false)
            })
    }, [])

    const saveNote = (note) => {
        const newNotes = [note, ...notes]
        setNotes(newNotes)
        AsyncStorage.setItem('notes', JSON.stringify(newNotes))
    }

    const deleteNote = (id) => {
        const newNotes = notes.filter((note) => note.id !== id)
        setNotes(newNotes)
        AsyncStorage.setItem('notes', JSON.stringify(newNotes))
    }

    return {
        notes,
        loading,
        saveNote,
        deleteNote
    }
}
