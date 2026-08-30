import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams } from 'expo-router'
import { LoadingOverlay } from '@/components/layout'
import { NoteEditorScreen } from '@/screens/notes'
import { useNoteAutosave, useNotes, useRegisterCurrent } from '@/hooks'
import { getDate } from '@/utils'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()

    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')

    useEffect(() => {
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

        setTimeout(() => {
            setLoading(false)
        }, 0)
    }, [slug])

    useNoteAutosave({
        id: slug, title, note, tags, createdAt, repositoryId,
        skip: loading,
        onSave: (newData) => updateNote({
            ...newData,
            updatedAt: getDate()
        })
    })

    if (loading) return <LoadingOverlay />

    return (
        <NoteEditorScreen
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
