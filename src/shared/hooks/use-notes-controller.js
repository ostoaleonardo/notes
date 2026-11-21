import { useContext, useMemo, useRef } from 'react'

import { useFileStorage } from './use-file-storage'
import { useFolders } from './use-folders'
import { useStorage } from './use-storage'
import { NoteContext } from '@/shared/context/note-context'
import { deleteNoteFiles, readDeleteBehavior } from '@/shared/utils/delete-note-files'
import { renameHeadingLinks } from '@/shared/utils/headings'
import { linkIndex } from '@/shared/utils/link-index'
import { noteBodies } from '@/shared/utils/note-body'
import { getVersionLocation } from '@/shared/utils/note-version-location'
import {
    createNote,
    getFolderUri,
    persistNoteMove,
    persistNoteUpdate,
    planMovedNoteLinks,
    planNoteUpdate,
    planWikiLinkRename,
    withOptimisticUpdate,
    writeChangedNotes
} from '@/shared/utils/note-operations'

export function useNotesController() {
    const fileStorage = useFileStorage()
    const { getItem } = useStorage()
    const { activeFolder, folders } = useFolders()

    const {
        notes,
        notesByPath,
        notePaths,
        setNotes,
        loading
    } = useContext(NoteContext)

    const saveQueues = useRef(new Map())
    const savedStamps = useRef(new Map())
    const latestRef = useRef(null)
    latestRef.current = { notes, notesByPath, notePaths, folders, activeFolder }

    const actions = useMemo(() => {
        const latest = () => latestRef.current

        const saveNote = async (note, folderId = latest().activeFolder?.id) => {
            const uri = getFolderUri(latest().folders, folderId)
            const { record, result } = await createNote({ note, folderId, uri }, fileStorage)

            setNotes((prev) => [record, ...prev])

            return result
        }

        const applyLinkRewrite = async ({ renameNote, changedNotes }) => {
            const originals = new Map(latest().notes.map((note) => [note.path, note]))

            setNotes((prev) => prev.map(renameNote))

            const { failed, saved } = await writeChangedNotes(
                changedNotes,
                latest().folders,
                fileStorage
            )

            setNotes((prev) => prev.map((note) => {
                if (failed.includes(note.path)) return originals.get(note.path)

                return saved.has(note.path) ? { ...note, ...saved.get(note.path) } : note
            }))
        }

        const loadLinkingBodies = async (targetPath, notesSnapshot, snapshotPaths) => {
            const target = notesSnapshot.find((note) => note.path === targetPath)
            const linking = target
                ? await linkIndex.findBacklinks(target, notesSnapshot, snapshotPaths)
                : notesSnapshot

            return noteBodies.load(linking)
        }

        const propagateWikiLinkRename = async (targetPath, newTitle, notesSnapshot, snapshotPaths) => (
            applyLinkRewrite(planWikiLinkRename({
                targetPath,
                newTitle,
                notes: notesSnapshot,
                notePaths: snapshotPaths,
                currentNotes: latest().notes,
                bodies: await loadLinkingBodies(targetPath, notesSnapshot, snapshotPaths)
            }))
        )

        const propagateHeadingRename = async (targetPath, renames, notesSnapshot, snapshotPaths) => (
            applyLinkRewrite(planWikiLinkRename({
                targetPath,
                notes: notesSnapshot,
                notePaths: snapshotPaths,
                currentNotes: latest().notes,
                bodies: await loadLinkingBodies(targetPath, notesSnapshot, snapshotPaths),
                rewrite: (content) => renameHeadingLinks(content, targetPath, renames, notesSnapshot, snapshotPaths)
            }))
        )

        const enqueueSave = (key, task) => {
            const queues = saveQueues.current
            const next = (queues.get(key) ?? Promise.resolve()).catch(() => {}).then(task)

            queues.set(key, next)
            next.catch(() => {}).finally(() => {
                if (queues.get(key) === next) queues.delete(key)
            })

            return next
        }

        const latestPrevious = (path) => {
            const previous = latest().notesByPath.get(path)
            const stamp = savedStamps.current.get(path)

            if (previous && stamp && stamp.updatedAt >= previous.updatedAt) return { ...previous, ...stamp }

            return previous
        }

        const rememberStamp = (oldPath, newPath, times) => {
            savedStamps.current.delete(oldPath)
            savedStamps.current.set(newPath, { updatedAt: times.updatedAt, fileUri: times.fileUri })
        }

        const updateNote = (note) => enqueueSave(note.path, () => runUpdateNote(note))

        const runUpdateNote = async (note) => {
            const { folders: currentFolders } = latest()
            const previous = latestPrevious(note.path)
            if (!previous) return saveNote(note, note.folderId)

            const uri = getFolderUri(currentFolders, note.folderId)
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
                        { note, previous, uri, plan, folders: currentFolders },
                        fileStorage
                    )
                    rememberStamp(previous.path, path, times)
                    setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...merged, ...times } : n)))

                    return { path, filename, ...times }
                }
            )
        }

        const deleteNote = async (path) => {
            const { notesByPath: byPath, folders: currentFolders } = latest()
            const note = byPath.get(path)
            if (!note) return

            const uri = getFolderUri(currentFolders, note.folderId)

            await withOptimisticUpdate(
                setNotes,
                {
                    apply: (prev) => prev.filter((n) => n.path !== path),
                    rollback: (prev) => [note, ...prev]
                },
                async () => {
                    if (!uri || !fileStorage.findFile(uri, note.filename)) return

                    const behavior = await readDeleteBehavior(getItem)
                    const { rootUri, folderPath } = getVersionLocation(currentFolders, note.folderId)

                    await deleteNoteFiles(behavior, {
                        uri,
                        rootUri,
                        folderId: note.folderId,
                        folderPath,
                        filename: note.filename
                    }, fileStorage)
                }
            )
        }

        const moveNote = async (path, destinationId) => {
            const { notesByPath: byPath, notePaths: currentPaths, folders: currentFolders } = latest()
            const note = byPath.get(path)
            if (!note || note.folderId === destinationId) return null

            const moved = await persistNoteMove({ note, destinationId, folders: currentFolders }, fileStorage)

            await applyLinkRewrite(planMovedNoteLinks({
                note,
                destinationId,
                notes: latest().notes,
                notePaths: currentPaths,
                folders: currentFolders,
                currentNotes: latest().notes,
                bodies: await loadLinkingBodies(note.path, latest().notes, currentPaths)
            }))
            setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...moved } : n)))

            return moved
        }

        const getNote = (path) => latest().notesByPath.get(path) || {}

        const deleteAll = async () => {
            setNotes([])

            const { activeFolder: active, folders: currentFolders } = latest()
            if (!active) return

            await fileStorage.clearRepository(active.uri, getVersionLocation(currentFolders, active.id))
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
