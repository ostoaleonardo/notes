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
    const saveQueueRef = useRef(Promise.resolve())

    const [path, setPath] = useState('')
    useRegisterCurrent(path)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')
    const [filename, setFilename] = useState('')
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

    const runExclusive = (fn) => {
        const result = saveQueueRef.current.then(fn, fn)
        saveQueueRef.current = result.catch(() => { })
        return result
    }

    const { flush } = useAutosave(() => runExclusive(async () => {
        if (!isSaved.current) {
            const payload = buildNotePayload({ title, note, tags, repositoryId, invalidFrontmatter })

            const saved = await saveNote(payload, repositoryId)

            pathRef.current = saved.path
            setPath(saved.path)
            setFilename(saved.filename)
            setCreatedAt(saved.createdAt)
            setUpdatedAt(saved.updatedAt)
            isSaved.current = true
        } else {
            const payload = buildNotePayload({ path: pathRef.current, title, note, tags, createdAt, repositoryId, invalidFrontmatter })

            let saved
            try {
                saved = await updateNote(payload)
            } catch (error) {
                if (error.code !== DUPLICATE_TITLE_ERROR) throw error

                showSnackbar(t('notes.title_duplicated'))
                return
            }

            pathRef.current = saved.path
            setPath(saved.path)
            setFilename(saved.filename)
            setCreatedAt(saved.createdAt)
            setUpdatedAt(saved.updatedAt)
        }
    }), [title, note, tags, repositoryId, invalidFrontmatter], {
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
            createdAt={createdAt}
            updatedAt={updatedAt}
            initialMode='live'
        />
    )
}
