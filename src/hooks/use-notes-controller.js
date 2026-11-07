import { useContext, useMemo, useRef } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { useStorage } from './use-storage'
import { NoteContext } from '@/context/note-context'
import { deleteNoteFiles, readDeleteBehavior } from '@/utils/delete-note-files'
import { renameHeadingLinks } from '@/utils/headings'
import { getVersionLocation } from '@/utils/note-version-location'
import {
    createNote,
    getRepositoryUri,
    persistNoteMove,
    persistNoteUpdate,
    planMovedNoteLinks,
    planNoteUpdate,
    planWikiLinkRename,
    withOptimisticUpdate,
    writeChangedNotes
} from '@/utils/note-operations'

export function useNotesController() {
    const fileStorage = useFileStorage()
    const { getItem } = useStorage()
    const { activeRepository, repositories } = useRepositories()

    const {
        notes,
        notesByPath,
        notePaths,
        setNotes,
        loading
    } = useContext(NoteContext)

    const latestRef = useRef(null)
    latestRef.current = { notes, notesByPath, notePaths, repositories, activeRepository }

    const actions = useMemo(() => {
        const latest = () => latestRef.current

        const saveNote = async (note, repositoryId = latest().activeRepository?.id) => {
            const uri = getRepositoryUri(latest().repositories, repositoryId)
            const { record, result } = createNote({ note, repositoryId, uri }, fileStorage)

            setNotes((prev) => [record, ...prev])

            return result
        }

        const applyLinkRewrite = async ({ renameNote, changedNotes }) => {
            setNotes((prev) => prev.map(renameNote))

            const failed = writeChangedNotes(changedNotes, latest().repositories, fileStorage)
            if (!failed.length) return

            const originals = new Map(latest().notes.map((note) => [note.path, note]))
            setNotes((prev) => prev.map((note) => (
                failed.includes(note.path) ? originals.get(note.path) : note
            )))
        }

        const propagateWikiLinkRename = (targetPath, newTitle, notesSnapshot, snapshotPaths) => applyLinkRewrite(
            planWikiLinkRename({
                targetPath,
                newTitle,
                notes: notesSnapshot,
                notePaths: snapshotPaths,
                currentNotes: latest().notes
            })
        )

        const propagateHeadingRename = (targetPath, renames, notesSnapshot, snapshotPaths) => applyLinkRewrite(
            planWikiLinkRename({
                targetPath,
                notes: notesSnapshot,
                notePaths: snapshotPaths,
                currentNotes: latest().notes,
                rewrite: (content) => renameHeadingLinks(content, targetPath, renames, notesSnapshot, snapshotPaths)
            })
        )

        const updateNote = async (note) => {
            const { notesByPath: byPath, repositories: currentRepositories } = latest()
            const previous = byPath.get(note.path)
            if (!previous) return saveNote(note, note.repositoryId)

            const uri = getRepositoryUri(currentRepositories, note.repositoryId)
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
                fileUri: previous.fileUri,
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

                    const { merged, ...times } = await persistNoteUpdate(
                        { note, previous, uri, plan, repositories: currentRepositories },
                        fileStorage
                    )
                    setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...merged, ...times } : n)))

                    return { path, filename, ...times }
                }
            )
        }

        const deleteNote = async (path) => {
            const { notesByPath: byPath, repositories: currentRepositories } = latest()
            const note = byPath.get(path)
            if (!note) return

            const uri = getRepositoryUri(currentRepositories, note.repositoryId)

            await withOptimisticUpdate(
                setNotes,
                {
                    apply: (prev) => prev.filter((n) => n.path !== path),
                    rollback: (prev) => [note, ...prev]
                },
                async () => {
                    if (!uri || !fileStorage.findFile(uri, note.filename)) return

                    const behavior = await readDeleteBehavior(getItem)
                    const { rootUri, folderPath } = getVersionLocation(currentRepositories, note.repositoryId)

                    await deleteNoteFiles(behavior, {
                        uri,
                        rootUri,
                        folderPath,
                        filename: note.filename
                    }, fileStorage)
                }
            )
        }

        const moveNote = async (path, destinationId) => {
            const { notesByPath: byPath, notePaths: currentPaths, repositories: currentRepositories } = latest()
            const note = byPath.get(path)
            if (!note || note.repositoryId === destinationId) return null

            const moved = await persistNoteMove({ note, destinationId, repositories: currentRepositories }, fileStorage)

            await applyLinkRewrite(planMovedNoteLinks({
                note,
                destinationId,
                notes: latest().notes,
                notePaths: currentPaths,
                repositories: currentRepositories,
                currentNotes: latest().notes
            }))
            setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...moved } : n)))

            return moved
        }

        const getNote = (path) => latest().notesByPath.get(path) || {}

        const deleteAll = () => {
            setNotes([])

            const { activeRepository: active, repositories: currentRepositories } = latest()
            if (!active) return

            fileStorage.clearRepository(active.uri, getVersionLocation(currentRepositories, active.id))
        }

        return {
            getNote,
            saveNote,
            deleteNote,
            moveNote,
            deleteAll,
            updateNote,
            propagateWikiLinkRename,
            propagateHeadingRename
        }
    }, [fileStorage, getItem, setNotes])

    return useMemo(() => ({
        notes,
        notePaths,
        loading,
        ...actions
    }), [notes, notePaths, loading, actions])
}
