import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { LoadingOverlay } from '@/components/layout'
import { NoteEditorScreen } from '@/screens/notes'
import { useCloseTabOnRemove, useNoteAutosave, useNotes, useTabs } from '@/hooks'
import { getDate } from '@/utils'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const { registerTab } = useTabs()

    const navigation = useNavigation()
    useCloseTabOnRemove(navigation, slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    useEffect(() => {
        const {
            title = '',
            note: content = '',
            tags = [],
            createdAt = Date.now(),
            updatedAt = '',
            biometrics = false,
            password = '',
            repositoryId = ''
        } = getNote(slug)

        setTitle(title || t('notes.untitled'))
        setNote(content)
        setTags(tags)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setBiometrics(biometrics)
        setPassword(password)
        setRepositoryId(repositoryId)

        setTimeout(() => {
            setLoading(false)
        }, 0)

        registerTab(slug)
    }, [slug])

    useNoteAutosave({
        id: slug, title, note, tags, password, biometrics, createdAt, repositoryId,
        skip: loading,
        onSave: (newData) => updateNote({
            ...newData,
            updatedAt: getDate()
        })
    })

    if (loading) return <LoadingOverlay />

    return (
        <NoteEditorScreen
            navigation={navigation}
            title={title}
            setTitle={setTitle}
            note={note}
            setNote={setNote}
            tags={tags}
            setTags={setTags}
            password={password}
            setPassword={setPassword}
            biometrics={biometrics}
            setBiometrics={setBiometrics}
            createdAt={createdAt}
            updatedAt={updatedAt}
            initialEditing={false}
        />
    )
}
