import { useCallback } from 'react'
import { randomUUID } from 'expo-crypto'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'

import { getWelcomeNote } from '@/utils/welcome-note'
import { getUniqueFilename } from '@/utils/note-filename'
import { getDate } from '@/utils/date'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useWelcomeNote() {
    const { getItem, setItem } = useStorage()
    const { listMarkdownFiles, writeNoteFile, readMetadata, writeMetadata } = useFileStorage()

    const seedWelcomeNote = useCallback(async (uri) => {
        const alreadyCreated = await getItem(STORAGE_KEYS.WELCOME_NOTE_CREATED)
        if (alreadyCreated) return null

        await setItem(STORAGE_KEYS.WELCOME_NOTE_CREATED, 'true')

        const { title, content } = getWelcomeNote()
        const id = randomUUID()
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, title, null)

        writeNoteFile(uri, filename, content)

        const metadata = await readMetadata(uri)
        metadata[id] = { filename, tags: [], createdAt: getDate(), updatedAt: '' }
        writeMetadata(uri, metadata)

        return id
    }, [
        getItem,
        setItem,
        readMetadata,
        writeMetadata,
        writeNoteFile,
        listMarkdownFiles
    ])

    return { seedWelcomeNote }
}
