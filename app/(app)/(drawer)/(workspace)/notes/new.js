import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { NoteEditorScreen } from '@/screens/notes'
import { useNoteAutosave, useNotes, useRegisterCurrent, useRepositories, useUtils } from '@/hooks'
import { getDate, getUniqueTitle } from '@/utils'

export default function Note() {
    const { t } = useTranslation()
    const { filter } = useUtils()
    const { activeRepository } = useRepositories()
    const { notes, saveNote, updateNote, setParamId } = useNotes()
    const { repositoryId: targetRepositoryId } = useLocalSearchParams()

    const isSaved = useRef(false)
    const firstRender = useRef(true)
    const autoTitleRef = useRef('')
    const notesRef = useRef(notes)

    const [id, setId] = useState('')
    useRegisterCurrent(id)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState(filter ? Array.from(filter) : [])

    const [createdAt, setCreatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')

    useEffect(() => {
        notesRef.current = notes
    }, [notes])

    useFocusEffect(
        useCallback(() => {
            const id = randomUUID()
            firstRender.current = false

            setId(id)
            setParamId(id)
            setRepositoryId(targetRepositoryId || activeRepository.id)

            const autoTitle = getUniqueTitle(notesRef.current.map((n) => n.title), t('notes.untitled'))
            autoTitleRef.current = autoTitle
            setTitle(autoTitle)
        }, [])
    )

    useNoteAutosave({
        id, title, note, tags, createdAt, repositoryId,
        skip: firstRender.current || (title === autoTitleRef.current && !note),
        onSave: (newData) => {
            if (!isSaved.current) {
                const createdAt = getDate()

                saveNote({
                    ...newData,
                    createdAt
                }, repositoryId)

                setCreatedAt(createdAt)
                isSaved.current = true
            } else {
                updateNote({
                    ...newData,
                    updatedAt: getDate()
                })
            }
        }
    })

    return (
        <NoteEditorScreen
            title={title}
            setTitle={setTitle}
            note={note}
            setNote={setNote}
            tags={tags}
            setTags={setTags}
            initialMode='live'
        />
    )
}
