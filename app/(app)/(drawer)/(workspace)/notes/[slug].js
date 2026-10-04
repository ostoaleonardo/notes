import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/components/layout'
import { RenameLinksDialog } from '@/screens/dialogs/rename-links-dialog'

import { useAutosave } from '@/hooks/use-autosave'
import { useNoteDraft } from '@/hooks/use-note-draft'
import { useTitleCommit } from '@/hooks/use-title-commit'
import { useNotes } from '@/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/hooks/use-wiki-link-rename-confirm'
import { useCurrentNote, useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { planExternalSync } from '@/utils/external-note-sync'

import { ROUTES } from '@/constants/routes'

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

    const {
        title, setTitle,
        note, setNote,
        tags, setTags,
        properties, setProperties,
        modifiedAt, setModifiedAt,
        repositoryId, setRepositoryId,
        filename, setFilename,
        invalidFrontmatter, setInvalidFrontmatter,
        buildPayload
    } = useNoteDraft(pathRef)

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

    useEffect(() => {
        if (loading || isSavingRef.current) return

        const incoming = notes.find((n) => n.path === pathRef.current)
        const synced = planExternalSync({
            draft: { note, tags, properties, invalidFrontmatter },
            original: {
                note: originalNoteRef.current,
                tags: originalTagsRef.current,
                properties: JSON.parse(originalPropertiesRef.current),
                invalidFrontmatter: originalInvalidFrontmatterRef.current
            },
            incoming: incoming && {
                note: incoming.note,
                tags: incoming.tags ?? [],
                properties: incoming.properties ?? {},
                invalidFrontmatter: incoming.invalidFrontmatter ?? null
            }
        })
        if (!synced) return

        setNote(synced.note)
        setTags(synced.tags)
        setProperties(synced.properties)
        setInvalidFrontmatter(synced.invalidFrontmatter)
        setModifiedAt(incoming.updatedAt || incoming.createdAt)
        originalNoteRef.current = synced.note
        originalTagsRef.current = synced.tags
        originalPropertiesRef.current = JSON.stringify(synced.properties)
        originalInvalidFrontmatterRef.current = synced.invalidFrontmatter
    }, [notes])

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

    const { onTitleBlur, onRestoreVersion } = useTitleCommit({
        title,
        note,
        titleRef: originalTitleRef,
        busyRef: isSavingRef,
        setTitle,
        setNote,
        buildPayload,
        runExclusive,
        saveWithLinkCheck,
        applySaved,
        onSaved: markSaved
    })

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
