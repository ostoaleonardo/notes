import { useContext } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '../context/note-context'
import { getUniqueFilename } from '@/utils/note-filename'
import { renameWikiLinksForNote } from '@/utils/wiki-links'

export function useNotes() {
    const {
        listMarkdownFiles,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile,
        clearRepository,
        readMetadata,
        writeMetadata
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

    const toMetadataEntry = (note, filename) => ({
        filename,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt || ''
    })

    const resolveFilename = (uri, title, currentFilename) => (
        getUniqueFilename(listMarkdownFiles(uri).map((file) => file.name), title, currentFilename)
    )

    const saveNote = async (note, repositoryId = activeRepository?.id) => {
        const uri = getRepositoryUri(repositoryId)
        const noteWithLocation = { ...note, repositoryId }

        setNotes((prev) => [noteWithLocation, ...prev])
        if (!uri) return

        try {
            const filename = resolveFilename(uri, note.title, null)

            writeNoteFile(uri, filename, note.note)

            const metadata = await readMetadata(uri)
            metadata[note.id] = toMetadataEntry(note, filename)
            writeMetadata(uri, metadata)
        } catch (error) {
            setNotes((prev) => prev.filter((n) => n.id !== note.id))
            throw error
        }
    }

    const propagateWikiLinkRename = async (targetId, newTitle, notesSnapshot, notePaths) => {
        const renameNote = (n) => {
            if (n.id === targetId) return n

            const renamed = renameWikiLinksForNote(n.note, targetId, newTitle, notesSnapshot, notePaths)
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

            const otherMetadata = await readMetadata(otherUri)

            for (const changedNote of notesInRepository) {
                const entry = otherMetadata[changedNote.id]
                if (!entry) continue

                writeNoteFile(otherUri, entry.filename, changedNote.note)
            }
        }
    }

    const updateNote = async (note) => {
        const previous = notes.find((n) => n.id === note.id)
        if (!previous) {
            return saveNote(note, note.repositoryId)
        }

        setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)))

        const uri = getRepositoryUri(note.repositoryId)
        if (!uri) return

        try {
            const metadata = await readMetadata(uri)
            const entry = metadata[note.id]
            if (!entry) return

            const filename = resolveFilename(uri, note.title, entry.filename)

            if (filename !== entry.filename) {
                await renameNoteFile(uri, entry.filename, filename)
            }

            writeNoteFile(uri, filename, note.note)

            metadata[note.id] = toMetadataEntry(note, filename)
            writeMetadata(uri, metadata)
        } catch (error) {
            setNotes((prev) => prev.map((n) => (n.id === note.id ? previous : n)))
            throw error
        }
    }

    const deleteNote = async (id) => {
        const note = notes.find((n) => n.id === id)
        setNotes((prev) => prev.filter((n) => n.id !== id))
        if (!note) return

        const uri = getRepositoryUri(note.repositoryId)
        if (!uri) return

        try {
            const metadata = await readMetadata(uri)
            const entry = metadata[id]
            if (!entry) return

            deleteNoteFile(uri, entry.filename)
            delete metadata[id]
            writeMetadata(uri, metadata)
        } catch (error) {
            setNotes((prev) => [note, ...prev])
            throw error
        }
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
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
