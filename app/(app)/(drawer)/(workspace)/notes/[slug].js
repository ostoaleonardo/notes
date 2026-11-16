import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/features/editor/native/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/ui/layout'
import { RenameLinksDialog } from '@/screens/dialogs/rename-links-dialog'

import { useAutosave } from '@/shared/hooks/use-autosave'
import { useNoteDraft } from '@/shared/hooks/use-note-draft'
import { useTitleCommit } from '@/shared/hooks/use-title-commit'
import { useNotes } from '@/shared/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/shared/hooks/use-wiki-link-rename-confirm'
import { useCurrentNote, useRegisterCurrent } from '@/shared/hooks/use-current-note'
import { useRepositories } from '@/shared/hooks/use-repositories'
import { useNoteVersions } from '@/shared/hooks/use-note-versions'
import { getVersionLocation } from '@/shared/utils/note-version-location'
import { logError } from '@/shared/utils/log-error'
import { planHeadingRenames } from '@/shared/utils/headings'
import { planExternalSync, toSyncShape } from '@/shared/utils/external-note-sync'
import { fromSavedSnapshot, isDraftSaved, toDraft, toSavedSnapshot } from '@/shared/utils/note-draft'

import { ANCHOR_PARAM } from '@/shared/constants/block-refs'
import { ROUTES } from '@/shared/constants/routes'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export default function EditNote() {
    const { t } = useTranslation()
    const { commitVersion } = useNoteVersions()
    const { registerCurrent } = useCurrentNote()
    const { slug, [ANCHOR_PARAM]: anchor } = useLocalSearchParams()
    const { repositories, loading: repositoriesLoading } = useRepositories()
    const { saveWithLinkCheck, ...renameDialogProps } = useWikiLinkRenameConfirm()

    const {
        notes,
        notePaths,
        getNote,
        updateNote,
        propagateHeadingRename,
        loading: notesLoading
    } = useNotes()

    const pathRef = useRef(slug)
    const isSavingRef = useRef(false)
    useRegisterCurrent(slug)

    const [loading, setLoading] = useState(true)
    const [initial] = useState(() => {
        const stored = notesLoading || repositoriesLoading ? null : getNote(slug)

        return stored && toDraft(stored, t('notes.untitled'))
    })

    const {
        editorProps,
        update,
        title, setTitle,
        note, setNote,
        tags,
        properties,
        repositoryId, setRepositoryId,
        filename, setFilename,
        invalidFrontmatter,
        rawFrontmatter,
        buildPayload
    } = useNoteDraft(pathRef, initial ?? undefined)

    const savedTitleRef = useRef(null)
    const savedRef = useRef(null)

    const loadNote = useEffectEvent(() => {
        const loaded = toDraft(getNote(pathRef.current), t('notes.untitled'))

        update(loaded)

        savedTitleRef.current = loaded.title
        savedRef.current = toSavedSnapshot(loaded)
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
            original: fromSavedSnapshot(savedRef.current),
            incoming: incoming && toSyncShape(incoming)
        })
        if (!synced) return

        update(synced.draft)
        savedRef.current = toSavedSnapshot(synced.original)

        if (synced.lostExternalText) {
            commitVersion(
                getVersionLocation(repositories, repositoryId),
                filename,
                savedTitleRef.current,
                synced.original.note
            ).catch((error) => logError(LOG_MESSAGES.ERROR_KEEPING_EXTERNAL_TEXT, error))
        }
    })

    useEffect(() => {
        syncExternalChanges()
    }, [notes])

    const applySaved = ({ path, filename }) => {
        if (path !== pathRef.current) {
            pathRef.current = path
            setFilename(filename)
            registerCurrent(path)
        }
    }

    const onMoved = ({ path, filename, repositoryId }) => {
        pathRef.current = path
        setFilename(filename)
        setRepositoryId(repositoryId)
        registerCurrent(path)
        router.setParams({ slug: path })
    }

    const markSaved = (savedContent) => {
        const { renames, rewritten } = planHeadingRenames({
            previous: savedRef.current.note,
            next: savedContent,
            path: pathRef.current,
            notes,
            notePaths
        })

        if (renames.length) propagateHeadingRename(pathRef.current, renames, notes, notePaths)
        if (rewritten) setNote((current) => (current === savedContent ? rewritten : current))

        savedRef.current = toSavedSnapshot({
            note: savedContent,
            tags,
            properties,
            invalidFrontmatter,
            rawFrontmatter
        })
    }

    const noteExists = useMemo(() => notes.some((n) => n.path === pathRef.current), [notes])

    const { flush, runExclusive } = useAutosave(async () => {
        if (isDraftSaved({ note, tags, properties, invalidFrontmatter, rawFrontmatter }, savedRef.current)) return

        const payload = buildPayload(savedTitleRef.current)

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
        titleRef: savedTitleRef,
        busyRef: isSavingRef,
        setTitle,
        setNote,
        buildPayload,
        runExclusive,
        saveWithLinkCheck,
        applySaved,
        onSaved: markSaved
    })

    if (loading && !initial) return <LoadingOverlay />

    return (
        <>
            <NoteEditorScreen
                id={pathRef.current}
                flush={flush}
                busyRef={isSavingRef}
                onMoved={onMoved}
                {...editorProps}
                onTitleBlur={onTitleBlur}
                onRestoreVersion={onRestoreVersion}
                anchor={anchor}
            />

            <RenameLinksDialog {...renameDialogProps} />
        </>
    )
}
