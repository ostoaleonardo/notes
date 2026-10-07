import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { RenameLinksDialog } from '@/screens/dialogs/rename-links-dialog'

import { useAutosave } from '@/hooks/use-autosave'
import { useNoteDraft } from '@/hooks/use-note-draft'
import { useTitleCommit } from '@/hooks/use-title-commit'
import { useNotes } from '@/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/hooks/use-wiki-link-rename-confirm'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getUniqueTitle } from '@/utils/note-filename'

import { EDITOR_MODES } from '@/constants/editor-modes'

export default function Note() {
    const { t } = useTranslation()
    const { activeRepository } = useRepositories()
    const { notes, saveNote, updateNote } = useNotes()
    const { repositoryId: targetRepositoryId } = useLocalSearchParams()

    const { saveWithLinkCheck, ...renameDialogProps } = useWikiLinkRenameConfirm()

    const isSaved = useRef(false)
    const pathRef = useRef('')
    const notesRef = useRef(notes)
    const autoTitleRef = useRef('')
    const savedTitleRef = useRef('')
    const savedSignatureRef = useRef('')
    const firstRender = useRef(true)

    const [path, setPath] = useState('')
    useRegisterCurrent(path)

    const {
        editorProps,
        title, setTitle,
        note, setNote,
        tags,
        properties,
        setModifiedAt,
        repositoryId, setRepositoryId,
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

        const resolvedRepositoryId = targetRepositoryId || activeRepository.id
        setRepositoryId(resolvedRepositoryId)

        const titlesInRepository = notesRef.current
            .filter((n) => n.repositoryId === resolvedRepositoryId)
            .map((n) => n.title)

        const autoTitle = getUniqueTitle(titlesInRepository, t('notes.untitled'))
        autoTitleRef.current = autoTitle
        setTitle(autoTitle)
    }

    useFocusEffect(
        useCallback(() => initDraftRef.current(), [])
    )

    const applySaved = (saved) => {
        pathRef.current = saved.path
        setPath(saved.path)
        setFilename(saved.filename)
        setModifiedAt(saved.updatedAt || saved.createdAt)
    }

    const { flush, runExclusive } = useAutosave(async () => {
        if (!isSaved.current) {
            const payload = buildPayload(title)
            const saved = await saveNote(payload, repositoryId)

            applySaved(saved)
            isSaved.current = true
            savedTitleRef.current = payload.title
            savedSignatureRef.current = JSON.stringify([note, tags, properties, invalidFrontmatter, rawFrontmatter])
            return
        }

        const signature = JSON.stringify([note, tags, properties, invalidFrontmatter, rawFrontmatter])
        if (signature === savedSignatureRef.current) return

        applySaved(await updateNote(buildPayload(savedTitleRef.current)))
        savedSignatureRef.current = signature
    }, [
        title,
        note,
        tags,
        properties,
        repositoryId,
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
