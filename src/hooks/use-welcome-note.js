import { useCallback } from 'react'
import { useTheme } from 'react-native-paper'

import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'

import { getWelcomeNote } from '@/utils/welcome-note'
import { getUniqueFilename } from '@/utils/note-filename'
import { buildNotePath } from '@/utils/note-path'
import { buildNoteFileContent } from '@/utils/frontmatter'

import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'

export function useWelcomeNote() {
    const { getItem, setItem } = useStorage()
    const { listMarkdownFiles, writeNoteFile } = useFileStorage()
    const { colors } = useTheme()

    const seedWelcomeNote = useCallback(async (uri, repositoryId) => {
        const alreadyCreated = await getItem(STORAGE_KEYS.WELCOME_NOTE_CREATED)
        if (alreadyCreated) return null

        await setItem(STORAGE_KEYS.WELCOME_NOTE_CREATED, STORAGE_BOOLEAN.TRUE)

        const { title, content } = getWelcomeNote(colors)
        const existingNames = listMarkdownFiles(uri).map((file) => file.name)
        const filename = getUniqueFilename(existingNames, title, null)

        writeNoteFile(uri, filename, buildNoteFileContent({ tags: [] }, content))

        return buildNotePath(repositoryId, filename)
    }, [
        getItem,
        setItem,
        writeNoteFile,
        listMarkdownFiles,
        colors
    ])

    return { seedWelcomeNote }
}
