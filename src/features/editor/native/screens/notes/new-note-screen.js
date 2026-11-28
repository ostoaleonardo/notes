import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/features/editor/native/screens/notes/note-editor-screen'
import { RenameLinksDialog } from '@/features/editor/native/screens/notes/rename-links-dialog'

import { useAutosave } from '@/shared/hooks/use-autosave'
import { useNoteDraft } from '@/shared/hooks/use-note-draft'
import { useTitleCommit } from '@/shared/hooks/use-title-commit'
import { useNotes } from '@/shared/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/shared/hooks/use-wiki-link-rename-confirm'
import { useRegisterCurrent } from '@/shared/hooks/use-current-note'
import { useFolders } from '@/shared/hooks/use-folders'
import { useDefaultNoteFolder } from '@/shared/hooks/use-default-note-folder'
import {
    getNewNoteTitle,
    isDraftSaved,
    resolveNewNoteFolderId,
    toSavedSnapshot
} from '@/shared/utils/note-draft'

import { EDITOR_MODES } from '@/shared/constants/editor-modes'

export default function Note() {
    const { t } = useTranslation()
    const { activeFolder } = useFolders()
    const { notes, saveNote, updateNote } = useNotes()
    const { folderId: targetFolderId } = useLocalSearchParams()
    const { saveWithLinkCheck, ...renameDialogProps } = useWikiLinkRenameConfirm()
    const defaultFolderId = useDefaultNoteFolder()

    const defaultFolderRef = useRef(defaultFolderId)
    defaultFolderRef.current = defaultFolderId

    const isSaved = useRef(false)
    const pathRef = useRef('')
    const notesRef = useRef(notes)
    const autoTitleRef = useRef('')
    const savedTitleRef = useRef('')
    const savedRef = useRef(null)
    const firstRender = useRef(true)

    const [path, setPath] = useState('')
    useRegisterCurrent(path)

    const {
        editorProps,
        title,
        setTitle,
        note,
        setNote,
        tags,
        properties,
        folderId,
        setFolderId,
        setFilename,
        invalidFrontmatter,
        rawFrontmatter,
        buildPayload
    } = useNoteDraft(pathRef)

    useEffect(() => {
        notesRef.current = notes
    }, [notes])

    const initDraftRef = useRef(null)
    initDraftRef.current = () => {
        firstRender.current = false

        const resolvedFolderId = resolveNewNoteFolderId({
            targetFolderId,
            defaultFolderId: defaultFolderRef.current,
            activeFolderId: activeFolder.id
        })
        setFolderId(resolvedFolderId)

        const autoTitle = getNewNoteTitle(notesRef.current, resolvedFolderId, t('notes.untitled'))
        autoTitleRef.current = autoTitle
        setTitle(autoTitle)
    }

    useEffect(() => {
        if (targetFolderId || isSaved.current || !defaultFolderId) return

        setFolderId(defaultFolderId)
    }, [targetFolderId, defaultFolderId, setFolderId])

    useFocusEffect(
        useCallback(() => initDraftRef.current(), [])
    )

    const applySaved = (saved) => {
        pathRef.current = saved.path
        setPath(saved.path)
        setFilename(saved.filename)
    }

    const { flush, runExclusive } = useAutosave(async () => {
        const content = { note, tags, properties, invalidFrontmatter, rawFrontmatter }

        if (!isSaved.current) {
            const payload = buildPayload(title)
            const saved = await saveNote(payload, folderId)

            applySaved(saved)
            isSaved.current = true
            savedTitleRef.current = payload.title
            savedRef.current = toSavedSnapshot(content)
            return
        }

        if (isDraftSaved(content, savedRef.current)) return

        const snapshot = toSavedSnapshot(content)

        applySaved(await updateNote(buildPayload(savedTitleRef.current)))
        savedRef.current = snapshot
    }, [
        title,
        note,
        tags,
        properties,
        folderId,
        invalidFrontmatter,
        rawFrontmatter
    ], {
        skip: firstRender.current || (title === autoTitleRef.current && !note)
    })

    const { onTitleBlur, onRestoreVersion } = useTitleCommit({
        title,
        note,
        titleRef: savedTitleRef,
        canCommit: () => isSaved.current,
        setTitle,
        setNote,
        buildPayload,
        runExclusive,
        saveWithLinkCheck,
        applySaved
    })

    return (
        <>
            <NoteEditorScreen
                id={path}
                flush={flush}
                {...editorProps}
                onTitleBlur={onTitleBlur}
                onRestoreVersion={onRestoreVersion}
                initialMode={EDITOR_MODES.LIVE}
            />

            <RenameLinksDialog {...renameDialogProps} />
        </>
    )
}
