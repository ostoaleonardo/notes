import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/components/layout'
import { RenameLinksDialog } from '@/screens/dialogs/rename-links-dialog'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/hooks/use-wiki-link-rename-confirm'
import { useCurrentNote, useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getDate } from '@/utils/date'
import { buildNotePayload } from '@/utils/note-payload'

import { ROUTES } from '@/constants/routes'

const tagsEqual = (a, b) => a.length === b.length && a.every((tag, i) => tag === b[i])

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { notes, getNote, updateNote, loading: notesLoading } = useNotes()
    const { loading: repositoriesLoading } = useRepositories()

    const {
        visible,
        linksCount,
        saveWithLinkCheck,
        onDismiss,
        onConfirmOnce,
        onConfirmAlways
    } = useWikiLinkRenameConfirm()

    const pathRef = useRef(slug)
    const isSavingRef = useRef(false)
    const saveQueueRef = useRef(Promise.resolve())
    const { registerCurrent } = useCurrentNote()
    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')
    const [filename, setFilename] = useState('')

    const originalTitleRef = useRef(null)
    const originalNoteRef = useRef(null)
    const originalTagsRef = useRef(null)

    useEffect(() => {
        if (notesLoading || repositoriesLoading) return

        const {
            title = '',
            note: content = '',
            tags = [],
            createdAt = Date.now(),
            updatedAt = '',
            repositoryId = '',
            filename = ''
        } = getNote(slug)

        const resolvedTitle = title || t('notes.untitled')

        setTitle(resolvedTitle)
        setNote(content)
        setTags(tags)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setRepositoryId(repositoryId)
        setFilename(filename)
        originalTitleRef.current = resolvedTitle
        originalNoteRef.current = content
        originalTagsRef.current = tags
        setLoading(false)
    }, [
        slug,
        notesLoading,
        repositoriesLoading
    ])

    useEffect(() => {
        if (notesLoading || repositoriesLoading || isSavingRef.current) return
        if (!notes.some((n) => n.path === pathRef.current)) router.replace(ROUTES.HOME)
    }, [notes, notesLoading, repositoriesLoading])

    const moveToPath = (nextPath, nextFilename) => {
        if (nextPath === pathRef.current) return

        pathRef.current = nextPath
        setFilename(nextFilename)
        registerCurrent(nextPath)
    }

    // Autosave and blur can both try to persist the same edit around the same
    // time; running them one at a time keeps pathRef.current accurate for
    // whichever one reads it next, instead of both reading it before either finishes.
    const runExclusive = (fn) => {
        const result = saveQueueRef.current.then(fn, fn)
        saveQueueRef.current = result.catch(() => {})
        return result
    }

    const { flush } = useAutosave(() => runExclusive(async () => {
        if (note === originalNoteRef.current && tagsEqual(tags, originalTagsRef.current)) return

        const updatedAt = getDate()
        const payload = buildNotePayload({
            path: pathRef.current,
            title: originalTitleRef.current,
            note,
            tags,
            createdAt,
            repositoryId,
            updatedAt
        })

        isSavingRef.current = true
        try {
            const saved = await updateNote(payload)
            moveToPath(saved.path, saved.filename)
            setUpdatedAt(updatedAt)
            originalNoteRef.current = note
            originalTagsRef.current = tags
        } finally {
            isSavingRef.current = false
        }
    }), [
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

        originalTitleRef.current = trimmedTitle

        runExclusive(async () => {
            const payload = buildNotePayload({ path: pathRef.current, title: trimmedTitle, note, tags, createdAt, repositoryId, updatedAt: getDate() })

            isSavingRef.current = true
            try {
                const { savedNote, path, filename: nextFilename } = await saveWithLinkCheck(payload, previousTitle)
                moveToPath(path, nextFilename)
                if (savedNote.note !== payload.note) setNote(savedNote.note)
            } finally {
                isSavingRef.current = false
            }
        })
    }

    if (loading) return <LoadingOverlay />

    return (
        <>
            <NoteEditorScreen
                id={pathRef.current}
                filename={filename}
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
                visible={visible}
                linksCount={linksCount}
                onDismiss={onDismiss}
                onConfirmOnce={onConfirmOnce}
                onConfirmAlways={onConfirmAlways}
            />
        </>
    )
}
