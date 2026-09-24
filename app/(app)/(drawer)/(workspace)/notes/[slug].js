import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/components/layout'
import { RenameLinksDialog } from '@/components/rename-links-dialog'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/hooks/use-wiki-link-rename-confirm'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getDate } from '@/utils/date'
import { buildNotePayload } from '@/utils/note-payload'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote, loading: notesLoading } = useNotes()
    const { loading: repositoriesLoading } = useRepositories()

    const {
        saveNote: saveNoteWithLinkCheck,
        dialogVisible: renameLinksDialogVisible,
        linksCount: renameLinksCount,
        onDismiss: onDismissRenameLinksDialog,
        onConfirmOnce: onConfirmRenameLinksOnce,
        onConfirmAlways: onConfirmRenameLinksAlways
    } = useWikiLinkRenameConfirm()

    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')

    const originalTitleRef = useRef(null)

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

        const resolvedTitle = title || t('notes.untitled')

        setTitle(resolvedTitle)
        setNote(content)
        setTags(tags)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setRepositoryId(repositoryId)
        originalTitleRef.current = resolvedTitle
        setLoading(false)
    }, [
        slug,
        notesLoading,
        repositoriesLoading
    ])

    const { flush } = useAutosave(async () => {
        const updatedAt = getDate()
        const payload = buildNotePayload({ id: slug, title, note, tags, createdAt, repositoryId, updatedAt })

        await updateNote(payload)
        setUpdatedAt(updatedAt)
    }, [
        slug,
        title,
        note,
        tags,
        createdAt,
        repositoryId
    ], {
        skip: loading
    })

    const onTitleBlur = () => {
        const previousTitle = originalTitleRef.current
        const trimmedTitle = title.trim()
        if (!previousTitle || previousTitle === trimmedTitle) return

        const payload = buildNotePayload({ id: slug, title: trimmedTitle, note, tags, createdAt, repositoryId, updatedAt: getDate() })
        const savedNote = saveNoteWithLinkCheck(payload, previousTitle)

        if (savedNote.note !== payload.note) setNote(savedNote.note)
        originalTitleRef.current = trimmedTitle
    }

    if (loading) return <LoadingOverlay />

    return (
        <>
            <NoteEditorScreen
                id={slug}
                repositoryId={repositoryId}
                flush={flush}
                title={title}
                setTitle={setTitle}
                onTitleBlur={onTitleBlur}
                note={note}
                setNote={setNote}
                tags={tags}
                setTags={setTags}
                createdAt={createdAt}
                updatedAt={updatedAt}
                initialMode='read'
            />

            <RenameLinksDialog
                visible={renameLinksDialogVisible}
                linksCount={renameLinksCount}
                onDismiss={onDismissRenameLinksDialog}
                onConfirmOnce={onConfirmRenameLinksOnce}
                onConfirmAlways={onConfirmRenameLinksAlways}
            />
        </>
    )
}
