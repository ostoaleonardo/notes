import { useContext, useRef } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { useStorage } from './use-storage'
import { NoteContext } from '../context/note-context'
import { deleteNoteFiles, readDeleteBehavior } from '@/utils/delete-note-files'
import { getVersionLocation } from '@/utils/note-version-location'
import {
    createNote,
    getRepositoryUri,
    persistNoteUpdate,
    planNoteUpdate,
    planWikiLinkRename,
    withOptimisticUpdate,
    writeChangedNotes
} from '@/utils/note-operations'

export function useNotes() {
    const fileStorage = useFileStorage()
    const { clearRepository } = fileStorage

    const { getItem } = useStorage()
    const { activeRepository, repositories } = useRepositories()

    const {
        notes,
        notesByPath,
        notePaths,
        setNotes,
        loading
    } = useContext(NoteContext)

    const currentNotesRef = useRef(notes)
    currentNotesRef.current = notes

    const saveNote = async (note, repositoryId = activeRepository?.id) => {
        const uri = getRepositoryUri(repositories, repositoryId)
        const { record, result } = createNote({ note, repositoryId, uri }, fileStorage)

        setNotes((prev) => [record, ...prev])

        return result
    }

    const propagateWikiLinkRename = async (targetPath, newTitle, notesSnapshot, notePaths) => {
        const { renameNote, changedNotes } = planWikiLinkRename({
            targetPath,
            newTitle,
            notes: notesSnapshot,
            notePaths,
            currentNotes: currentNotesRef.current
        })

        setNotes((prev) => prev.map(renameNote))

        const failed = writeChangedNotes(changedNotes, repositories, fileStorage)
        if (!failed.length) return

        const originals = new Map(currentNotesRef.current.map((note) => [note.path, note]))
        setNotes((prev) => prev.map((note) => (
            failed.includes(note.path) ? originals.get(note.path) : note
        )))
    }

    const updateNote = async (note) => {
        const previous = notesByPath.get(note.path)
        if (!previous) return saveNote(note, note.repositoryId)

        const uri = getRepositoryUri(repositories, note.repositoryId)
        const unchanged = {
            path: previous.path,
            filename: previous.filename,
            createdAt: previous.createdAt,
            updatedAt: previous.updatedAt
        }

        if (!uri) {
            setNotes((prev) => prev.map((n) => (
                n.path === previous.path ? { ...note, filename: previous.filename, path: previous.path } : n
            )))
            return unchanged
        }

        const plan = planNoteUpdate({ note, previous, uri }, fileStorage)
        const { filename, path, existing } = plan

        const optimistic = {
            ...note,
            filename,
            path,
            rawFrontmatter: note.rawFrontmatter ?? previous.rawFrontmatter,
            createdAt: previous.createdAt,
            updatedAt: previous.updatedAt
        }

        return withOptimisticUpdate(
            setNotes,
            {
                apply: (prev) => prev.map((n) => (n.path === previous.path ? optimistic : n)),
                rollback: (prev) => prev.map((n) => (n.path === path ? previous : n))
            },
            async () => {
                if (!existing) return { ...unchanged, path, filename }

                const times = await persistNoteUpdate({ note, previous, uri, plan, repositories }, fileStorage)
                setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...times } : n)))

                return { path, filename, ...times }
            }
        )
    }

    const deleteNote = async (path) => {
        const note = notesByPath.get(path)
        if (!note) return

        const uri = getRepositoryUri(repositories, note.repositoryId)

        await withOptimisticUpdate(
            setNotes,
            {
                apply: (prev) => prev.filter((n) => n.path !== path),
                rollback: (prev) => [note, ...prev]
            },
            async () => {
                if (!uri || !fileStorage.findFile(uri, note.filename)) return

                const behavior = await readDeleteBehavior(getItem)
                const { rootUri, folderPath } = getVersionLocation(repositories, note.repositoryId)

                await deleteNoteFiles(behavior, {
                    uri,
                    rootUri,
                    folderPath,
                    filename: note.filename
                }, fileStorage)
            }
        )
    }

    const getNote = (path) => {
        return notesByPath.get(path) || {}
    }

    const deleteAll = () => {
        setNotes([])
        if (!activeRepository) return

        clearRepository(activeRepository.uri, getVersionLocation(repositories, activeRepository.id))
    }

    return {
        notes,
        notePaths,
        getNote,
        saveNote,
        deleteNote,
        deleteAll,
        updateNote,
        propagateWikiLinkRename,
        loading
    }
}
