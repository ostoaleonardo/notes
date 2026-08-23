import { useContext } from 'react'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { useRepositories } from './use-repositories'
import { NoteContext } from '../context/note-context'
import { STORAGE_KEYS } from '@/constants'
import { getUniqueFilename } from '@/utils'

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

    const { getItem } = useStorage()
    const { activeRepository, repositories } = useRepositories()

    const {
        notes,
        setNotes,
        paramId,
        setParamId,
        loading
    } = useContext(NoteContext)

    const getRepositoryUri = (repositoryId) => (
        repositories.find((repository) => repository.id === repositoryId)?.uri
    )

    const toMetadataEntry = (note, filename) => ({
        filename,
        tags: note.tags,
        password: note.password,
        biometrics: note.biometrics,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt || '',
        images: note.images
    })

    const saveNote = async (note, repositoryId = activeRepository.id) => {
        const uri = getRepositoryUri(repositoryId)
        const noteWithLocation = { ...note, repositoryId }

        setNotes([noteWithLocation, ...notes])

        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, note.title, null)

        writeNoteFile(uri, filename, note.note)

        const metadata = await readMetadata(uri)
        metadata[note.id] = toMetadataEntry(note, filename)
        writeMetadata(uri, metadata)
    }

    const updateNote = async (note) => {
        setNotes(notes.map((n) => {
            if (n.id === note.id) return note
            return n
        }))

        const uri = getRepositoryUri(note.repositoryId)
        const metadata = await readMetadata(uri)
        const entry = metadata[note.id]
        if (!entry) return

        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, note.title, entry.filename)

        if (filename !== entry.filename) {
            await renameNoteFile(uri, entry.filename, filename)
        }

        writeNoteFile(uri, filename, note.note)

        metadata[note.id] = toMetadataEntry(note, filename)
        writeMetadata(uri, metadata)
    }

    const deleteNote = async (id) => {
        const note = notes.find((n) => n.id === id)
        setNotes(notes.filter((n) => n.id !== id))
        if (!note) return

        const uri = getRepositoryUri(note.repositoryId)
        const metadata = await readMetadata(uri)
        const entry = metadata[id]
        if (!entry) return

        deleteNoteFile(uri, entry.filename)
        delete metadata[id]
        writeMetadata(uri, metadata)
    }

    const getNote = (id) => {
        return notes.find((note) => note.id === id) || {}
    }

    const deleteAll = async () => {
        setNotes([])

        const repositoriesJson = await getItem(STORAGE_KEYS.REPOSITORIES)
        const activeRepositoryId = await getItem(STORAGE_KEYS.ACTIVE_REPOSITORY)
        const repositories = repositoriesJson ? JSON.parse(repositoriesJson) : []
        const repository = repositories.find((f) => f.id === activeRepositoryId)

        if (repository) clearRepository(repository.uri)
    }

    return {
        notes,
        getNote,
        saveNote,
        deleteNote,
        deleteAll,
        updateNote,
        paramId,
        setParamId,
        loading
    }
}
