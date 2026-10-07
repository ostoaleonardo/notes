import { useEffect, useEffectEvent, useRef, useState } from 'react'
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
import { useNoteVersions } from '@/hooks/use-note-versions'
import { getVersionLocation } from '@/utils/note-version-location'
import { logError } from '@/utils/log-error'
import { findHeadingRenames, renameHeadingLinks } from '@/utils/headings'
import { planExternalSync } from '@/utils/external-note-sync'

import { ANCHOR_PARAM } from '@/constants/block-refs'
import { ROUTES } from '@/constants/routes'
import { LOG_MESSAGES } from '@/constants/log-messages'

const tagsEqual = (a, b) => a.length === b.length && a.every((tag, i) => tag === b[i])

export default function EditNote() {
    const { t } = useTranslation()
    const { slug, [ANCHOR_PARAM]: anchor } = useLocalSearchParams()
    const { registerCurrent } = useCurrentNote()
    const {
        notes,
        notePaths,
        getNote,
        updateNote,
        propagateHeadingRename,
        loading: notesLoading
    } = useNotes()
    const { repositories, loading: repositoriesLoading } = useRepositories()
    const { commitVersion } = useNoteVersions()

    const { saveWithLinkCheck, ...renameDialogProps } = useWikiLinkRenameConfirm()

    const pathRef = useRef(slug)
    const isSavingRef = useRef(false)
    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)

    const {
        editorProps,
        title, setTitle,
        note, setNote,
        tags, setTags,
        properties, setProperties,
        setModifiedAt,
        repositoryId, setRepositoryId,
        filename, setFilename,
        invalidFrontmatter, setInvalidFrontmatter,
        rawFrontmatter, setRawFrontmatter,
        buildPayload
    } = useNoteDraft(pathRef)

    const originalTitleRef = useRef(null)
    const originalNoteRef = useRef(null)
    const originalTagsRef = useRef(null)
    const originalPropertiesRef = useRef(null)
    const originalInvalidFrontmatterRef = useRef(null)
    const originalRawFrontmatterRef = useRef(null)

    const loadNote = useEffectEvent(() => {
        const {
            title = '',
            note: content = '',
            tags = [],
            properties = {},
            createdAt = '',
            updatedAt = '',
            repositoryId = '',
            filename = '',
            invalidFrontmatter = null,
            rawFrontmatter = null
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
        setRawFrontmatter(rawFrontmatter)

        originalTitleRef.current = resolvedTitle
        originalNoteRef.current = content
        originalTagsRef.current = tags
        originalPropertiesRef.current = JSON.stringify(properties)
        originalInvalidFrontmatterRef.current = invalidFrontmatter
        originalRawFrontmatterRef.current = rawFrontmatter
        setLoading(false)
    })

    useEffect(() => {
        if (notesLoading || repositoriesLoading) return

        loadNote()
    }, [
        slug,
        notesLoading,
        repositoriesLoading
    ])

    useEffect(() => {
        if (notesLoading || repositoriesLoading || isSavingRef.current) return
        if (!notes.some((n) => n.path === pathRef.current)) router.replace(ROUTES.HOME)
    }, [notes, notesLoading, repositoriesLoading])

    const syncExternalChanges = useEffectEvent(() => {
        if (loading || isSavingRef.current) return

        const incoming = notes.find((n) => n.path === pathRef.current)
        const synced = planExternalSync({
            draft: { note, tags, properties, invalidFrontmatter, rawFrontmatter },
            original: {
                note: originalNoteRef.current,
                tags: originalTagsRef.current,
                properties: JSON.parse(originalPropertiesRef.current),
                invalidFrontmatter: originalInvalidFrontmatterRef.current,
                rawFrontmatter: originalRawFrontmatterRef.current
            },
            incoming: incoming && {
                note: incoming.note,
                tags: incoming.tags ?? [],
                properties: incoming.properties ?? {},
                invalidFrontmatter: incoming.invalidFrontmatter ?? null,
                rawFrontmatter: incoming.rawFrontmatter ?? null
            }
        })
        if (!synced) return

        setNote(synced.draft.note)
        setTags(synced.draft.tags)
        setProperties(synced.draft.properties)
        setInvalidFrontmatter(synced.draft.invalidFrontmatter)
        setRawFrontmatter(synced.draft.rawFrontmatter)
        setModifiedAt(incoming.updatedAt || incoming.createdAt)
        originalNoteRef.current = synced.original.note
        originalTagsRef.current = synced.original.tags
        originalPropertiesRef.current = JSON.stringify(synced.original.properties)
        originalInvalidFrontmatterRef.current = synced.original.invalidFrontmatter
        originalRawFrontmatterRef.current = synced.original.rawFrontmatter

        if (synced.lostExternalText) {
            commitVersion(
                getVersionLocation(repositories, repositoryId),
                filename,
                originalTitleRef.current,
                synced.original.note
            ).catch((error) => logError(LOG_MESSAGES.ERROR_KEEPING_EXTERNAL_TEXT, error))
        }
    })

    useEffect(() => {
        syncExternalChanges()
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
        const renames = findHeadingRenames(originalNoteRef.current || '', savedContent || '')
        if (renames.length) {
            propagateHeadingRename(pathRef.current, renames, notes, notePaths)

            const rewritten = renameHeadingLinks(savedContent, pathRef.current, renames, notes, notePaths)
            if (rewritten !== savedContent) {
                setNote((current) => (current === savedContent ? rewritten : current))
            }
        }

        originalNoteRef.current = savedContent
        originalTagsRef.current = tags
        originalPropertiesRef.current = JSON.stringify(properties)
        originalInvalidFrontmatterRef.current = invalidFrontmatter
        originalRawFrontmatterRef.current = rawFrontmatter
    }

    const noteExists = notes.some((n) => n.path === pathRef.current)

    const { flush, runExclusive } = useAutosave(async () => {
        if (
            note === originalNoteRef.current &&
            tagsEqual(tags, originalTagsRef.current) &&
            JSON.stringify(properties) === originalPropertiesRef.current &&
            invalidFrontmatter === originalInvalidFrontmatterRef.current &&
            rawFrontmatter === originalRawFrontmatterRef.current
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
        invalidFrontmatter,
        rawFrontmatter
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
                flush={flush}
                busyRef={isSavingRef}
                {...editorProps}
                onTitleBlur={onTitleBlur}
                onRestoreVersion={onRestoreVersion}
                anchor={anchor}
            />

            <RenameLinksDialog {...renameDialogProps} />
        </>
    )
}
