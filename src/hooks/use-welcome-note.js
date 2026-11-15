import { useCallback } from 'react'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'

import { getWelcomeNote } from '@/utils/welcome-note'
import { getUniqueFilenameBy } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'
import { buildNoteFileContent } from '@/utils/frontmatter'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'

export function useWelcomeNote() {
    const { getItem, setItem } = useStorage()
    const { fileExists, writeNoteFile } = useFileStorage()

    const seedWelcomeNote = useCallback(async (uri, repositoryId) => {
        const alreadyCreated = await getItem(STORAGE_KEYS.WELCOME_NOTE_CREATED)
        if (alreadyCreated) return null

        await setItem(STORAGE_KEYS.WELCOME_NOTE_CREATED, STORAGE_BOOLEAN.TRUE)

        const { title, content } = getWelcomeNote()
        const filename = getUniqueFilenameBy((name) => fileExists(uri, name), title, null)

        writeNoteFile(uri, filename, buildNoteFileContent({ tags: [] }, content))

        return buildNotePath(repositoryId, filename)
    }, [
        getItem,
        setItem,
        writeNoteFile,
        fileExists
    ])

    return { seedWelcomeNote }
}
