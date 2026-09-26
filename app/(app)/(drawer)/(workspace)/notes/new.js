import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getDate } from '@/utils/date'
import { getUniqueTitle } from '@/utils/note-filename'
import { buildNotePayload } from '@/utils/note-payload'

export default function Note() {
    const { t } = useTranslation()
    const { activeRepository } = useRepositories()
    const { notes, saveNote, updateNote } = useNotes()
    const { repositoryId: targetRepositoryId } = useLocalSearchParams()

    const isSaved = useRef(false)
    const notesRef = useRef(notes)
    const autoTitleRef = useRef('')
    const firstRender = useRef(true)

    const [id, setId] = useState('')
    useRegisterCurrent(id)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

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

            const resolvedRepositoryId = targetRepositoryId || activeRepository.id

            setId(id)
            setRepositoryId(resolvedRepositoryId)

            const titlesInRepository = notesRef.current
                .filter((n) => n.repositoryId === resolvedRepositoryId)
                .map((n) => n.title)

            const autoTitle = getUniqueTitle(titlesInRepository, t('notes.untitled'))
            autoTitleRef.current = autoTitle
            setTitle(autoTitle)
        }, [])
    )

    const { flush } = useAutosave(async () => {
        if (!isSaved.current) {
            const createdAt = getDate()
            const payload = buildNotePayload({ id, title, note, tags, createdAt, repositoryId })

            await saveNote(payload, repositoryId)

            setCreatedAt(createdAt)
            isSaved.current = true
        } else {
            const updatedAt = getDate()
            const payload = buildNotePayload({ id, title, note, tags, createdAt, repositoryId, updatedAt })

            await updateNote(payload)
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
