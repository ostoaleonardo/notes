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
    const { registerCurrent } = useCurrentNote()
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
    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])
    const [properties, setProperties] = useState({})

    const [modifiedAt, setModifiedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')
    const [filename, setFilename] = useState('')
    const [invalidFrontmatter, setInvalidFrontmatter] = useState(null)

    const originalTitleRef = useRef(null)
    const originalNoteRef = useRef(null)
    const originalTagsRef = useRef(null)
    const originalPropertiesRef = useRef(null)
    const originalInvalidFrontmatterRef = useRef(null)

    useEffect(() => {
        if (notesLoading || repositoriesLoading) return

        const {
            title = '',
            note: content = '',
            tags = [],
            properties = {},
            createdAt = '',
            updatedAt = '',
            repositoryId = '',
            filename = '',
            invalidFrontmatter = null
        } = getNote(pathRef.current)

        const resolvedTitle = title || t('notes.untitled')

        setTitle(resolvedTitle)
        setNote(content)
        setTags(tags)
        setProperties(properties)
        setModifiedAt(updatedAt || createdAt)
        setRepositoryId(repositoryId)
        setFilename(filename)
        setInvalidFrontmatter(invalidFrontmatter)
        originalTitleRef.current = resolvedTitle
        originalNoteRef.current = content
        originalTagsRef.current = tags
        originalPropertiesRef.current = JSON.stringify(properties)
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

    const applySaved = ({ path, filename, createdAt, updatedAt }) => {
        if (path !== pathRef.current) {
            pathRef.current = path
            setFilename(filename)
            registerCurrent(path)
        }

        setModifiedAt(updatedAt || createdAt)
    }

    const markSaved = (savedContent) => {
        originalNoteRef.current = savedContent
        originalTagsRef.current = tags
        originalPropertiesRef.current = JSON.stringify(properties)
        originalInvalidFrontmatterRef.current = invalidFrontmatter
    }

    const buildPayload = (payloadTitle, payloadNote = note) => buildNotePayload({
        path: pathRef.current,
        title: payloadTitle,
        note: payloadNote,
        tags,
        properties,
        repositoryId,
        invalidFrontmatter
    })

    const noteExists = notes.some((n) => n.path === pathRef.current)

    const { flush, runExclusive } = useAutosave(async () => {
        if (
            note === originalNoteRef.current &&
            tagsEqual(tags, originalTagsRef.current) &&
            JSON.stringify(properties) === originalPropertiesRef.current &&
            invalidFrontmatter === originalInvalidFrontmatterRef.current
        ) return

        const payload = buildPayload(originalTitleRef.current)

        isSavingRef.current = true

        try {
            applySaved(await updateNote(payload))
            markSaved(note)
        } finally {
            isSavingRef.current = false
        }
    }, [
        note,
        tags,
        properties,
        repositoryId,
        invalidFrontmatter
    ], {
        skip: loading || !noteExists
    })

    const commitTitle = (nextTitle, nextNote = note) => {
        const previousTitle = originalTitleRef.current
        if (!previousTitle || previousTitle === nextTitle) return

        originalTitleRef.current = nextTitle

        runExclusive(async () => {
            const payload = buildPayload(nextTitle, nextNote)
            isSavingRef.current = true

            try {
                const { savedNote, ...saved } = await saveWithLinkCheck(payload, previousTitle)

                const rewritten = savedNote.note !== payload.note

                applySaved(saved)
                markSaved(rewritten ? savedNote.note : nextNote)

                if (rewritten) setNote(savedNote.note)
            } catch (error) {
                if (error.code !== DUPLICATE_TITLE_ERROR) throw error

                setTitle(previousTitle)
                showSnackbar(t('notes.title_duplicated'))
                originalTitleRef.current = previousTitle
            } finally {
                isSavingRef.current = false
            }
        })
    }

    const onTitleBlur = () => commitTitle(title.trim())

    const onRestoreVersion = (version) => {
        setTitle(version.title)
        setNote(version.content)
        commitTitle(version.title.trim(), version.content)
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
                onRestoreVersion={onRestoreVersion}
                note={note}
                setNote={setNote}
                tags={tags}
                setTags={setTags}
                properties={properties}
                setProperties={setProperties}
                invalidFrontmatter={invalidFrontmatter}
                setInvalidFrontmatter={setInvalidFrontmatter}
                modifiedAt={modifiedAt}
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
