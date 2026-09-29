import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/components/layout'
import { RenameLinksDialog } from '@/screens/dialogs/rename-links-dialog'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/hooks/use-wiki-link-rename-confirm'
import { useCurrentNote, useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { buildNotePayload } from '@/utils/note-payload'

import { ROUTES } from '@/constants/routes'
import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

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
    const [invalidFrontmatter, setInvalidFrontmatter] = useState(null)

    const originalTitleRef = useRef(null)
    const originalNoteRef = useRef(null)
    const originalTagsRef = useRef(null)
    const originalInvalidFrontmatterRef = useRef(null)

    useEffect(() => {
        if (notesLoading || repositoriesLoading) return

        const {
            title = '',
            note: content = '',
            tags = [],
            createdAt = Date.now(),
            updatedAt = '',
            repositoryId = '',
            filename = '',
            invalidFrontmatter = null
        } = getNote(slug)

        const resolvedTitle = title || t('notes.untitled')

        setTitle(resolvedTitle)
        setNote(content)
        setTags(tags)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setRepositoryId(repositoryId)
        setFilename(filename)
        setInvalidFrontmatter(invalidFrontmatter)
        originalTitleRef.current = resolvedTitle
        originalNoteRef.current = content
        originalTagsRef.current = tags
        originalInvalidFrontmatterRef.current = invalidFrontmatter
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

    const runExclusive = (fn) => {
        const result = saveQueueRef.current.then(fn, fn)
        saveQueueRef.current = result.catch(() => { })
        return result
    }

    const { flush } = useAutosave(() => runExclusive(async () => {
        if (
            note === originalNoteRef.current &&
            tagsEqual(tags, originalTagsRef.current) &&
            invalidFrontmatter === originalInvalidFrontmatterRef.current
        ) return

        const payload = buildNotePayload({
            path: pathRef.current,
            title: originalTitleRef.current,
            note,
            tags,
            createdAt,
            repositoryId,
            invalidFrontmatter
        })

        isSavingRef.current = true
        try {
            const saved = await updateNote(payload)
            moveToPath(saved.path, saved.filename)
            setCreatedAt(saved.createdAt)
            setUpdatedAt(saved.updatedAt)
            originalNoteRef.current = note
            originalTagsRef.current = tags
            originalInvalidFrontmatterRef.current = invalidFrontmatter
        } finally {
            isSavingRef.current = false
        }
    }), [
        note,
        tags,
        createdAt,
        repositoryId,
        invalidFrontmatter
    ], {
        skip: loading
    })

    const onTitleBlur = () => {
        const previousTitle = originalTitleRef.current
        const trimmedTitle = title.trim()
        if (!previousTitle || previousTitle === trimmedTitle) return

        originalTitleRef.current = trimmedTitle

        runExclusive(async () => {
            const payload = buildNotePayload({ path: pathRef.current, title: trimmedTitle, note, tags, createdAt, repositoryId, invalidFrontmatter })

            isSavingRef.current = true
            try {
                const { savedNote, path, filename: nextFilename, createdAt: nextCreatedAt, updatedAt: nextUpdatedAt } = await saveWithLinkCheck(payload, previousTitle)
                moveToPath(path, nextFilename)
                setCreatedAt(nextCreatedAt)
                setUpdatedAt(nextUpdatedAt)
                if (savedNote.note !== payload.note) setNote(savedNote.note)
            } catch (error) {
                if (error.code !== DUPLICATE_TITLE_ERROR) throw error

                originalTitleRef.current = previousTitle
                setTitle(previousTitle)
                showSnackbar(t('notes.title_duplicated'))
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
                invalidFrontmatter={invalidFrontmatter}
                setInvalidFrontmatter={setInvalidFrontmatter}
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
