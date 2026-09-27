import { useContext } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '../context/note-context'
import { getUniqueFilename } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'
import { renameWikiLinksForNote } from '@/utils/wiki-links'

export function useNotes() {
    const {
        listMarkdownFiles,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile,
        clearRepository,
        readMetadata,
        writeMetadata,
        renameVersions,
        deleteVersions
    } = useFileStorage()

    const { activeRepository, repositories } = useRepositories()

    const {
        notes,
        setNotes,
        loading
    } = useContext(NoteContext)

    const getRepositoryUri = (repositoryId) => (
        repositories.find((repository) => repository.id === repositoryId)?.uri
    )

    const toMetadataEntry = (note) => ({
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt || ''
    })

    const resolveFilename = (uri, title, currentFilename) => (
        getUniqueFilename(listMarkdownFiles(uri).map((file) => file.name), title, currentFilename)
    )

    const saveNote = async (note, repositoryId = activeRepository?.id) => {
        const uri = getRepositoryUri(repositoryId)

        if (!uri) {
            setNotes((prev) => [{ ...note, repositoryId, filename: '', path: '' }, ...prev])
            return { path: '', filename: '' }
        }

        const filename = resolveFilename(uri, note.title, null)
        const path = buildNotePath(repositoryId, filename)
        const noteWithLocation = { ...note, repositoryId, filename, path }

        setNotes((prev) => [noteWithLocation, ...prev])

        try {
            writeNoteFile(uri, filename, note.note)

            const metadata = await readMetadata(uri)
            metadata[filename] = toMetadataEntry(note)
            writeMetadata(uri, metadata)
        } catch (error) {
            setNotes((prev) => prev.filter((n) => n.path !== path))
            throw error
        }

        return { path, filename }
    }

    const propagateWikiLinkRename = async (targetPath, newTitle, notesSnapshot, notePaths) => {
        const renameNote = (n) => {
            if (n.path === targetPath) return n

            const renamed = renameWikiLinksForNote(n.note, targetPath, newTitle, notesSnapshot, notePaths)
            return renamed === n.note ? n : { ...n, note: renamed }
        }

        setNotes((prev) => prev.map(renameNote))

        const changedNotes = notesSnapshot
            .map(renameNote)
            .filter((n, index) => n !== notesSnapshot[index])

        const changedByRepository = new Map()
        changedNotes.forEach((n) => {
            const group = changedByRepository.get(n.repositoryId) || []
            group.push(n)
            changedByRepository.set(n.repositoryId, group)
        })

        for (const [repositoryId, notesInRepository] of changedByRepository) {
            const otherUri = getRepositoryUri(repositoryId)
            if (!otherUri) continue

            for (const changedNote of notesInRepository) {
                writeNoteFile(otherUri, changedNote.filename, changedNote.note)
            }
        }
    }

    const updateNote = async (note) => {
        const previous = notes.find((n) => n.path === note.path)
        if (!previous) {
            return saveNote(note, note.repositoryId)
        }

        const uri = getRepositoryUri(note.repositoryId)
        if (!uri) {
            setNotes((prev) => prev.map((n) => (
                n.path === previous.path ? { ...note, filename: previous.filename, path: previous.path } : n
            )))
            return { path: previous.path, filename: previous.filename }
        }

        const filename = resolveFilename(uri, note.title, previous.filename)
        const path = buildNotePath(note.repositoryId, filename)
        const renamed = filename !== previous.filename
        const noteWithLocation = { ...note, filename, path }

        setNotes((prev) => prev.map((n) => (n.path === previous.path ? noteWithLocation : n)))

        try {
            const metadata = await readMetadata(uri)
            if (!metadata[previous.filename]) return { path, filename }

            if (renamed) {
                await renameNoteFile(uri, previous.filename, filename)
                await renameVersions(uri, previous.filename, filename)
                delete metadata[previous.filename]
            }

            writeNoteFile(uri, filename, note.note)
            metadata[filename] = toMetadataEntry(note)
            writeMetadata(uri, metadata)
        } catch (error) {
            setNotes((prev) => prev.map((n) => (n.path === path ? previous : n)))
            throw error
        }

        return { path, filename }
    }

    const deleteNote = async (path) => {
        const note = notes.find((n) => n.path === path)
        setNotes((prev) => prev.filter((n) => n.path !== path))
        if (!note) return

        const uri = getRepositoryUri(note.repositoryId)
        if (!uri) return

        try {
            const metadata = await readMetadata(uri)
            if (!metadata[note.filename]) return

            deleteNoteFile(uri, note.filename)
            deleteVersions(uri, note.filename)
            delete metadata[note.filename]
            writeMetadata(uri, metadata)
        } catch (error) {
            setNotes((prev) => [note, ...prev])
            throw error
        }
    }

    const getNote = (path) => {
        return notes.find((note) => note.path === path) || {}
    }

    const deleteAll = () => {
        setNotes([])
        if (activeRepository) clearRepository(activeRepository.uri)
    }

    return {
        notes,
        getNote,
        saveNote,
        deleteNote,
        deleteAll,
        updateNote,
        propagateWikiLinkRename,
        loading
    }
}
