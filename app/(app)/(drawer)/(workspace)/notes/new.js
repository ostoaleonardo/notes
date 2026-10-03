import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { RenameLinksDialog } from '@/screens/dialogs/rename-links-dialog'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useWikiLinkRenameConfirm } from '@/hooks/use-wiki-link-rename-confirm'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getUniqueTitle } from '@/utils/note-filename'
import { buildNotePayload } from '@/utils/note-payload'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

export default function Note() {
    const { t } = useTranslation()
    const { activeRepository } = useRepositories()
    const { notes, saveNote, updateNote } = useNotes()
    const { repositoryId: targetRepositoryId } = useLocalSearchParams()

    const {
        visible,
        linksCount,
        saveWithLinkCheck,
        onDismiss,
        onConfirmOnce,
        onConfirmAlways
    } = useWikiLinkRenameConfirm()

    const isSaved = useRef(false)
    const pathRef = useRef('')
    const notesRef = useRef(notes)
    const autoTitleRef = useRef('')
    const savedTitleRef = useRef('')
    const savedSignatureRef = useRef('')
    const firstRender = useRef(true)

    const [path, setPath] = useState('')
    const [filename, setFilename] = useState('')
    useRegisterCurrent(path)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])
    const [properties, setProperties] = useState({})

    const [modifiedAt, setModifiedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')
    const [invalidFrontmatter, setInvalidFrontmatter] = useState(null)

    useEffect(() => {
        notesRef.current = notes
    }, [notes])

    useFocusEffect(
        useCallback(() => {
            firstRender.current = false

            const resolvedRepositoryId = targetRepositoryId || activeRepository.id
            setRepositoryId(resolvedRepositoryId)

            const titlesInRepository = notesRef.current
                .filter((n) => n.repositoryId === resolvedRepositoryId)
                .map((n) => n.title)

            const autoTitle = getUniqueTitle(titlesInRepository, t('notes.untitled'))
            autoTitleRef.current = autoTitle
            setTitle(autoTitle)
        }, [])
    )

    const applySaved = (saved) => {
        pathRef.current = saved.path
        setPath(saved.path)
        setFilename(saved.filename)
        setModifiedAt(saved.updatedAt || saved.createdAt)
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

    const { flush, runExclusive } = useAutosave(async () => {
        if (!isSaved.current) {
            const payload = buildPayload(title)
            const saved = await saveNote(payload, repositoryId)

            applySaved(saved)
            isSaved.current = true
            savedTitleRef.current = payload.title
            savedSignatureRef.current = JSON.stringify([note, tags, properties, invalidFrontmatter])
            return
        }

        const signature = JSON.stringify([note, tags, properties, invalidFrontmatter])
        if (signature === savedSignatureRef.current) return

        applySaved(await updateNote(buildPayload(savedTitleRef.current)))
        savedSignatureRef.current = signature
    }, [
        title,
        note,
        tags,
        properties,
        repositoryId,
        invalidFrontmatter
    ], {
        skip: firstRender.current || (title === autoTitleRef.current && !note)
    })

    const commitTitle = (nextTitle, nextNote = note) => {
        const previousTitle = savedTitleRef.current
        if (!isSaved.current || !previousTitle || previousTitle === nextTitle) return

        savedTitleRef.current = nextTitle

        runExclusive(async () => {
            const payload = buildPayload(nextTitle, nextNote)

            try {
                const { savedNote, ...saved } = await saveWithLinkCheck(payload, previousTitle)

                applySaved(saved)
                if (savedNote.note !== payload.note) setNote(savedNote.note)
            } catch (error) {
                if (error.code !== DUPLICATE_TITLE_ERROR) throw error

                setTitle(previousTitle)
                showSnackbar(t('notes.title_duplicated'))
                savedTitleRef.current = previousTitle
            }
        })
    }

    const onTitleBlur = () => commitTitle(title.trim())

    const onRestoreVersion = (version) => {
        setTitle(version.title)
        setNote(version.content)
        commitTitle(version.title.trim(), version.content)
    }

    return (
        <>
            <NoteEditorScreen
                id={path}
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
                initialMode={EDITOR_MODES.LIVE}
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
