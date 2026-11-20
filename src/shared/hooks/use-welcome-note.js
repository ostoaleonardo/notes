import { useCallback } from 'react'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'

import { getWelcomeNote } from '@/shared/utils/welcome-note'
import { getUniqueFilenameBy } from '@/shared/utils/note-filename'
import { buildNotePath } from '@/shared/utils/note-path'
import { composeNoteFile } from '@/shared/utils/note-file-content'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/shared/constants/storage-values'

export function useWelcomeNote() {
    const { getItem, setItem } = useStorage()
    const { fileExists, writeNoteFile } = useFileStorage()

    const seedWelcomeNote = useCallback(async (uri, folderId) => {
        const alreadyCreated = await getItem(STORAGE_KEYS.WELCOME_NOTE_CREATED)
        if (alreadyCreated) return null

        await setItem(STORAGE_KEYS.WELCOME_NOTE_CREATED, STORAGE_BOOLEAN.TRUE)

        const { title, content } = getWelcomeNote()
        const filename = getUniqueFilenameBy((name) => fileExists(uri, name), title, null)

        writeNoteFile(uri, filename, composeNoteFile({ tags: [] }, content))

        return buildNotePath(folderId, filename)
    }, [
        getItem,
        setItem,
        writeNoteFile,
        fileExists
    ])

    return { seedWelcomeNote }
}
