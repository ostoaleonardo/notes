import { useContext } from 'react'

import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { useStorage } from './use-storage'
import { NoteContext } from '../context/note-context'
import { getUniqueFilename, isTitleTaken } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'
import { deleteNoteFiles } from '@/utils/delete-note-files'
import { buildNoteFileContent } from '@/utils/frontmatter'
import { renameWikiLinksForNote } from '@/utils/wiki-links'

import { DEFAULT_DELETE_BEHAVIOR } from '@/constants/delete-behavior'
import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useNotes() {
    const fileStorage = useFileStorage()
    const {
        listMarkdownFiles,
        writeNoteFile,
        renameNoteFile,
        findFile,
        clearRepository,
        renameVersions
    } = fileStorage

    const { getItem } = useStorage()
    const { activeRepository, repositories, getRootRepository } = useRepositories()

    const {
        notes,
        setNotes,
        loading
    } = useContext(NoteContext)

    const getRepositoryUri = (repositoryId) => (
        repositories.find((repository) => repository.id === repositoryId)?.uri
    )

    const buildFileContent = (note) => buildNoteFileContent(note, note.note)

    const listNoteNames = (uri) => listMarkdownFiles(uri).map((file) => file.name)

    const saveNote = async (note, repositoryId = activeRepository?.id) => {
        const uri = getRepositoryUri(repositoryId)

        if (!uri) {
            setNotes((prev) => [{ ...note, repositoryId, filename: '', path: '' }, ...prev])
            return { path: '', filename: '' }
        }

        const filename = getUniqueFilename(listNoteNames(uri), note.title, null)
        const path = buildNotePath(repositoryId, filename)
        const file = writeNoteFile(uri, filename, buildFileContent(note))
        const createdAt = file.creationTime ?? file.lastModified
        const updatedAt = file.lastModified

        setNotes((prev) => [{ ...note, repositoryId, filename, path, createdAt, updatedAt }, ...prev])

        return { path, filename, createdAt, updatedAt }
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
                writeNoteFile(otherUri, changedNote.filename, buildFileContent(changedNote))
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
            return { path: previous.path, filename: previous.filename, createdAt: previous.createdAt, updatedAt: previous.updatedAt }
        }

        const names = listNoteNames(uri)

        if (note.title !== previous.title && isTitleTaken(names, note.title, previous.filename)) {
            const error = new Error('A note with this title already exists')
            error.code = DUPLICATE_TITLE_ERROR
            throw error
        }

        const filename = getUniqueFilename(names, note.title, previous.filename)
        const path = buildNotePath(note.repositoryId, filename)
        const renamed = filename !== previous.filename
        const noteWithLocation = { ...note, filename, path, createdAt: previous.createdAt, updatedAt: previous.updatedAt }

        setNotes((prev) => prev.map((n) => (n.path === previous.path ? noteWithLocation : n)))

        let createdAt = previous.createdAt
        let updatedAt = previous.updatedAt

        try {
            if (!names.includes(previous.filename)) return { path, filename, createdAt, updatedAt }

            if (renamed) {
                await renameNoteFile(uri, previous.filename, filename)
                await renameVersions(uri, previous.filename, filename)
            }

            const file = writeNoteFile(uri, filename, buildFileContent(note))
            createdAt = file.creationTime ?? file.lastModified
            updatedAt = file.lastModified

            setNotes((prev) => prev.map((n) => (n.path === path ? { ...n, createdAt, updatedAt } : n)))
        } catch (error) {
            setNotes((prev) => prev.map((n) => (n.path === path ? previous : n)))
            throw error
        }

        return { path, filename, createdAt, updatedAt }
    }

    const deleteNote = async (path) => {
        const note = notes.find((n) => n.path === path)
        setNotes((prev) => prev.filter((n) => n.path !== path))
        if (!note) return

        const uri = getRepositoryUri(note.repositoryId)
        if (!uri) return

        try {
            if (!findFile(uri, note.filename)) return

            const behavior = (await getItem(STORAGE_KEYS.DELETE_BEHAVIOR)) || DEFAULT_DELETE_BEHAVIOR
            const repository = repositories.find((r) => r.id === note.repositoryId)

            await deleteNoteFiles(behavior, {
                uri,
                rootUri: getRootRepository(repository).uri,
                filename: note.filename
            }, fileStorage)
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
