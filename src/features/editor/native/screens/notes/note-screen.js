import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/features/editor/native/screens/notes/note-editor-screen'
import { LoadingOverlay } from '@/ui/layout'
import { RenameLinksDialog } from '@/features/editor/native/screens/notes/rename-links-dialog'

import { useAutosave } from '@/shared/hooks/use-autosave'
import { useNoteDraft } from '@/shared/hooks/use-note-draft'
import { useTitleCommit } from '@/shared/hooks/use-title-commit'
import { useNotes } from '@/shared/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/shared/hooks/use-wiki-link-rename-confirm'
import { useCurrentNote, useRegisterCurrent } from '@/shared/hooks/use-current-note'
import { useFolders } from '@/shared/hooks/use-folders'
import { useExternalNoteSync } from '@/features/editor/native/hooks/use-external-note-sync'
import { noteBodies } from '@/shared/utils/note-body'
import { planHeadingRenames } from '@/shared/utils/headings'
import { isDraftSaved, toDraft, toSavedSnapshot } from '@/shared/utils/note-draft'

import { ANCHOR_PARAM } from '@/shared/constants/block-refs'
import { ROUTES } from '@/shared/constants/routes'

export const NoteScreen = () => {
    const { t } = useTranslation()
    const { registerCurrent } = useCurrentNote()
    const { slug, [ANCHOR_PARAM]: anchor } = useLocalSearchParams()
    const { loading: repositoriesLoading } = useFolders()
    const { saveWithLinkCheck, ...renameDialogProps } = useWikiLinkRenameConfirm()

    const {
        notes,
        folderPathByNote,
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

        return stored && stored.note !== undefined ? toDraft(stored, t('notes.untitled')) : null
    })

    const {
        draft,
        update,
        title, setTitle,
        note, setNote,
        tags,
        properties,
        folderId, setFolderId,
        filename, setFilename,
        invalidFrontmatter,
        rawFrontmatter,
        buildPayload
    } = useNoteDraft(pathRef, initial ?? undefined)

    const savedTitleRef = useRef(null)
    const savedRef = useRef(null)

    const loadNote = useEffectEvent(async () => {
        const path = pathRef.current
        const stored = getNote(path)
        const body = await noteBodies.get(stored)
        if (pathRef.current !== path) return

        noteBodies.pin(stored, body)

        const loaded = toDraft(stored, t('notes.untitled'), body)

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

    useExternalNoteSync({
        enabled: !loading,
        pathRef,
        isSavingRef,
        savedRef,
        savedTitleRef,
        content: { note, tags, properties, invalidFrontmatter, rawFrontmatter },
        update,
        folderId,
        filename
    })

    const applySaved = ({ path, filename }) => {
        if (path !== pathRef.current) {
            pathRef.current = path
            setFilename(filename)
            registerCurrent(path)
        }
    }

    const onMoved = ({ path, filename, folderId }) => {
        pathRef.current = path
        setFilename(filename)
        setFolderId(folderId)
        registerCurrent(path)
        router.setParams({ slug: path })
    }

    const markSaved = (savedContent) => {
        const { renames, rewritten } = planHeadingRenames({
            previous: savedRef.current.note,
            next: savedContent,
            path: pathRef.current,
            notes,
            folderPathByNote
        })

        if (renames.length) propagateHeadingRename(pathRef.current, renames, notes, folderPathByNote)
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
        folderId,
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
                draft={draft}
                onTitleBlur={onTitleBlur}
                onRestoreVersion={onRestoreVersion}
                anchor={anchor}
            />

            <RenameLinksDialog {...renameDialogProps} />
        </>
    )
}
