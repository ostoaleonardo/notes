import { createContext, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { randomUUID } from 'expo-crypto'
import { useStorage } from '../hooks/use-storage'
import { CATEGORIES_FILENAME, TRASH_FILENAME, useFileStorage } from '../hooks/use-file-storage'
import { useRepositories } from '../hooks/use-repositories'
import { DEFAULT_CATEGORIES, DEFAULT_NOTE_CATEGORIES, STORAGE_KEYS } from '@/constants'
import { getNoteKey, getUniqueFilename, NOTE_KEY_PREFIX } from '@/utils'

export const NoteContext = createContext()

const getTitle = (filename) => filename.replace(/\.md$/i, '')

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
    const [trash, setTrash] = useState(new Set())
    const [paramId, setParamId] = useState('')
    const [loading, setLoading] = useState(true)

    const { getItem, removeItem, getAllKeys, multiGet, multiSet, multiRemove } = useStorage()
    const { listMarkdownFiles, writeNoteFile, readMetadata, writeMetadata, readJson, writeJson } = useFileStorage()
    const { activeRepository } = useRepositories()

    useEffect(() => {
        if (!activeRepository) return

        const migrateLegacyBlobNotes = async () => {
            const legacy = await getItem(STORAGE_KEYS.NOTES)
            if (!legacy) return

            const legacyNotes = JSON.parse(legacy)
            await multiSet(legacyNotes.map((note) => [getNoteKey(note.id), JSON.stringify(note)]))
            await removeItem(STORAGE_KEYS.NOTES)
        }

        const migrateStorageNotesToFiles = async () => {
            const keys = await getAllKeys()
            const noteKeys = keys.filter((key) => key.startsWith(NOTE_KEY_PREFIX))
            if (noteKeys.length === 0) return

            const entries = await multiGet(noteKeys)
            const legacyNotes = entries.map(([, value]) => JSON.parse(value))

            const metadata = await readMetadata(activeRepository.uri)
            const existingNames = listMarkdownFiles(activeRepository.uri).map((file) => file.name)

            for (const note of legacyNotes) {
                const filename = getUniqueFilename(existingNames, note.title, null)
                existingNames.push(filename)

                writeNoteFile(activeRepository.uri, filename, note.note || '')
                metadata[note.id] = {
                    filename,
                    categories: note.categories || DEFAULT_NOTE_CATEGORIES,
                    password: note.password || '',
                    biometrics: note.biometrics || false,
                    createdAt: note.createdAt || Date.now(),
                    updatedAt: note.updatedAt || '',
                    images: note.images || []
                }
            }

            writeMetadata(activeRepository.uri, metadata)
            await multiRemove(noteKeys)
        }

        const loadNotesFromFolder = async () => {
            const files = listMarkdownFiles(activeRepository.uri)
            const metadata = await readMetadata(activeRepository.uri)

            const fileNames = new Set(files.map((file) => file.name))
            let metadataChanged = false

            for (const id of Object.keys(metadata)) {
                if (!fileNames.has(metadata[id].filename)) {
                    delete metadata[id]
                    metadataChanged = true
                }
            }

            const filenameToId = new Map(
                Object.entries(metadata).map(([id, entry]) => [entry.filename, id])
            )

            const notes = await Promise.all(files.map(async (file) => {
                let id = filenameToId.get(file.name)

                if (!id) {
                    id = randomUUID()
                    metadata[id] = {
                        filename: file.name,
                        categories: DEFAULT_NOTE_CATEGORIES,
                        password: '',
                        biometrics: false,
                        createdAt: Date.now(),
                        updatedAt: '',
                        images: []
                    }
                    metadataChanged = true
                }

                const entry = metadata[id]
                const content = await file.text()

                return {
                    id,
                    title: getTitle(file.name),
                    note: content,
                    categories: entry.categories,
                    password: entry.password,
                    biometrics: entry.biometrics,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                    images: entry.images || []
                }
            }))

            if (metadataChanged) writeMetadata(activeRepository.uri, metadata)

            return notes
        }

        const loadCategories = async () => {
            const existing = await readJson(activeRepository.uri, CATEGORIES_FILENAME, null)
            if (existing) return existing

            const legacy = await getItem(STORAGE_KEYS.CATEGORIES)
            const categories = legacy ? JSON.parse(legacy) : DEFAULT_CATEGORIES

            writeJson(activeRepository.uri, CATEGORIES_FILENAME, categories)
            if (legacy) await removeItem(STORAGE_KEYS.CATEGORIES)

            return categories
        }

        const loadTrash = async () => {
            const existing = await readJson(activeRepository.uri, TRASH_FILENAME, null)
            if (existing) return existing

            const legacy = await getItem(STORAGE_KEYS.TRASH)
            let trash = []

            if (legacy) {
                const parsed = JSON.parse(legacy)
                trash = Array.isArray(parsed) ? parsed : Object.values(parsed)
            }

            writeJson(activeRepository.uri, TRASH_FILENAME, trash)
            if (legacy) await removeItem(STORAGE_KEYS.TRASH)

            return trash
        }

        const getNotes = async (showLoading = true) => {
            if (showLoading) setLoading(true)

            try {
                await migrateLegacyBlobNotes()
                await migrateStorageNotesToFiles()

                const notes = await loadNotesFromFolder()
                const categories = await loadCategories()
                const trash = await loadTrash()

                setNotes(notes)
                setCategories(categories)
                setTrash(new Set(trash))
            } catch (error) {
                console.error('Error loading notes:', error)
            } finally {
                if (showLoading) setLoading(false)
            }
        }

        getNotes()

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') getNotes(false)
        })

        return () => subscription.remove()
    }, [activeRepository?.uri])

    const clear = () => {
        setNotes([])
        setTrash(new Set())
        setCategories(DEFAULT_CATEGORIES)
    }

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                categories,
                setCategories,
                trash,
                setTrash,
                paramId,
                setParamId,
                loading,
                clear
            }}
        >
            {children}
        </NoteContext.Provider>
    )
}
