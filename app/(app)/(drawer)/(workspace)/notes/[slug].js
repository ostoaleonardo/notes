import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/components/layout'

import { useNoteAutosave } from '@/hooks/use-note-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getDate } from '@/utils/date'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote, loading: notesLoading } = useNotes()
    const { loading: repositoriesLoading } = useRepositories()

    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')

    useEffect(() => {
        if (notesLoading || repositoriesLoading) return

        const {
            title = '',
            note: content = '',
            tags = [],
            createdAt = Date.now(),
            updatedAt = '',
            repositoryId = ''
        } = getNote(slug)

        setTitle(title || t('notes.untitled'))
        setNote(content)
        setTags(tags)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setRepositoryId(repositoryId)
        setLoading(false)
    }, [slug, notesLoading, repositoriesLoading])

    useNoteAutosave({
        id: slug, title, note, tags, createdAt, repositoryId,
        skip: loading,
        onSave: (newData) => {
            const updatedAt = getDate()
            updateNote({ ...newData, updatedAt })
            setUpdatedAt(updatedAt)
        }
    })

    if (loading) return <LoadingOverlay />

    return (
        <NoteEditorScreen
            id={slug}
            repositoryId={repositoryId}
            title={title}
            setTitle={setTitle}
            note={note}
            setNote={setNote}
            tags={tags}
            setTags={setTags}
            createdAt={createdAt}
            updatedAt={updatedAt}
            initialMode='read'
        />
    )
}
