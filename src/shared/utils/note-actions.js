import { deleteNoteFiles, readDeleteBehavior } from '@/shared/utils/delete-note-files'
import { getVersionLocation } from '@/shared/utils/note-version-location'
import {
    createNote,
    getFolderUri,
    persistNoteMove,
    persistNoteUpdate,
    planNoteUpdate,
    withOptimisticUpdate
} from '@/shared/utils/note-operations'

export const createNoteActions = ({ latest, setNotes, fileStorage, getItem, saveQueue, links }) => {
    const saveNote = async (note, folderId = latest().activeFolder?.id) => {
        const uri = getFolderUri(latest().folders, folderId)
        const { record, result } = await createNote({ note, folderId, uri }, fileStorage)

        setNotes((prev) => [record, ...prev])

        return result
    }

    const runUpdateNote = async (note) => {
        const { folders } = latest()
        const previous = saveQueue.withLatestStamp(latest().notesByPath.get(note.path))
        if (!previous) return saveNote(note, note.folderId)

        const uri = getFolderUri(folders, note.folderId)
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
                    { note, previous, uri, plan, folders },
                    fileStorage
                )
                saveQueue.rememberStamp(previous.path, path, times)
                setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...merged, ...times } : n)))

                return { path, filename, ...times }
            }
        )
    }

    const updateNote = (note) => saveQueue.enqueue(note.path, () => runUpdateNote(note))

    const deleteNote = async (path) => {
        const { notesByPath, folders } = latest()
        const note = notesByPath.get(path)
        if (!note) return

        const uri = getFolderUri(folders, note.folderId)

        await withOptimisticUpdate(
            setNotes,
            {
                apply: (prev) => prev.filter((n) => n.path !== path),
                rollback: (prev) => [note, ...prev]
            },
            async () => {
                if (!uri || !fileStorage.findFile(uri, note.filename)) return

                const behavior = await readDeleteBehavior(getItem)
                const { rootUri, folderPath } = getVersionLocation(folders, note.folderId)

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
        const { notesByPath, folders } = latest()
        const note = notesByPath.get(path)
        if (!note || note.folderId === destinationId) return null

        const moved = await persistNoteMove({ note, destinationId, folders }, fileStorage)

        await links.propagateNoteMove(note, destinationId)
        setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, ...moved } : n)))

        return moved
    }

    const getNote = (path) => latest().notesByPath.get(path) || {}

    const deleteAll = async () => {
        setNotes([])

        const { activeFolder, folders } = latest()
        if (!activeFolder) return

        await fileStorage.clearRepository(activeFolder.uri, getVersionLocation(folders, activeFolder.id))
    }

    return { getNote, saveNote, deleteNote, moveNote, deleteAll, updateNote }
}
