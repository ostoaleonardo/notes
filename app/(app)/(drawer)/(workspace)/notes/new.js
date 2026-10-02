import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
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

    const isSaved = useRef(false)
    const pathRef = useRef('')
    const notesRef = useRef(notes)
    const autoTitleRef = useRef('')
    const firstRender = useRef(true)

    const [path, setPath] = useState('')
    const [filename, setFilename] = useState('')
    useRegisterCurrent(path)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

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

    const { flush } = useAutosave(async () => {
        if (!isSaved.current) {
            const payload = buildNotePayload({
                title,
                note,
                tags,
                repositoryId,
                invalidFrontmatter
            })

            const saved = await saveNote(payload, repositoryId)

            applySaved(saved)
            isSaved.current = true
        } else {
            const payload = buildNotePayload({
                path: pathRef.current,
                title,
                note,
                tags,
                repositoryId,
                invalidFrontmatter
            })

            let saved
            try {
                saved = await updateNote(payload)
            } catch (error) {
                if (error.code !== DUPLICATE_TITLE_ERROR) throw error

                showSnackbar(t('notes.title_duplicated'))
                return
            }

            applySaved(saved)
        }
    }, [
        title,
        note,
        tags,
        repositoryId,
        invalidFrontmatter
    ], {
        skip: firstRender.current || (title === autoTitleRef.current && !note)
    })

    return (
        <NoteEditorScreen
            id={path}
            filename={filename}
            repositoryId={repositoryId}
            flush={flush}
            title={title}
            setTitle={setTitle}
            note={note}
            setNote={setNote}
            tags={tags}
            setTags={setTags}
            invalidFrontmatter={invalidFrontmatter}
            setInvalidFrontmatter={setInvalidFrontmatter}
            modifiedAt={modifiedAt}
            initialMode={EDITOR_MODES.LIVE}
        />
    )
}
