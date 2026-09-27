import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'

import { NoteEditorScreen } from '@/screens/notes/note-editor-screen'

import { useAutosave } from '@/hooks/use-autosave'
import { useNotes } from '@/hooks/use-notes'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { getDate } from '@/utils/date'
import { getUniqueTitle } from '@/utils/note-filename'
import { buildNotePayload } from '@/utils/note-payload'

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

    // A manual flush() (export/share) can overlap with an in-flight debounced
    // save; running them one at a time avoids saving the note twice.
    const runExclusive = (fn) => {
        const result = saveQueueRef.current.then(fn, fn)
        saveQueueRef.current = result.catch(() => {})
        return result
    }

    const { flush } = useAutosave(() => runExclusive(async () => {
        if (!isSaved.current) {
            const createdAt = getDate()
            const payload = buildNotePayload({ title, note, tags, createdAt, repositoryId })

            const saved = await saveNote(payload, repositoryId)

            pathRef.current = saved.path
            setPath(saved.path)
            setFilename(saved.filename)
            setCreatedAt(createdAt)
            isSaved.current = true
        } else {
            const updatedAt = getDate()
            const payload = buildNotePayload({ path: pathRef.current, title, note, tags, createdAt, repositoryId, updatedAt })

            const saved = await updateNote(payload)

            pathRef.current = saved.path
            setPath(saved.path)
            setFilename(saved.filename)
            setUpdatedAt(updatedAt)
        }
    }), [title, note, tags, createdAt, repositoryId], {
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
            createdAt={createdAt}
            updatedAt={updatedAt}
            initialMode='live'
        />
    )
}
