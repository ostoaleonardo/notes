import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { useUtils } from '@/hooks/use-utils'
import { getDate } from '@/utils/date'
import { getUniqueTitle } from '@/utils/note-filename'

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
    const [updatedAt, setUpdatedAt] = useState('')
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

    const { flush } = useAutosave(() => {
        const newData = {
            id,
            title: title.trim(),
            note: note.trim(),
            tags,
            createdAt,
            repositoryId
        }

        if (!isSaved.current) {
            const createdAt = getDate()

            saveNote({ ...newData, createdAt }, repositoryId)

            setCreatedAt(createdAt)
            isSaved.current = true
        } else {
            const updatedAt = getDate()
            updateNote({ ...newData, updatedAt })
            setUpdatedAt(updatedAt)
        }
    }, [id, title, note, tags, createdAt, repositoryId], {
        skip: firstRender.current || (title === autoTitleRef.current && !note)
    })

    return (
        <NoteEditorScreen
            id={id}
            repositoryId={repositoryId}
            flush={flush}
            title={title}
            setTitle={setTitle}
            note={note}
            setNote={setNote}
            tags={tags}
            setTags={setTags}
            createdAt={createdAt}
            updatedAt={updatedAt}
            initialMode='live'
        />
    )
}
