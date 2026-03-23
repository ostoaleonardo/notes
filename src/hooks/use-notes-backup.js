import { useContext } from 'react'
import { useDrive } from './use-drive'
import { useStorage } from './use-storage'
import { STORAGE_KEYS } from '@/constants'
import { SyncContext } from '@/context/sync-context'

export function useNotesBackup() {
    const {
        notesToSync,
        setNotesToSync,
        notesBackup,
        setNotesBackup
    } = useContext(SyncContext)

    const { setItem } = useStorage()
    const { multipartUpload, updateFile, deleteFile } = useDrive()

    const backup = async (action, note) => {
        try {
            switch (action) {
                case 'create':
                    await createBackup(note)
                    break
                case 'update':
                    await updateBackup(note)
                    break
                case 'delete':
                    await deleteBackup(note.id)
                    break
                default:
                    break
            }
        } catch (error) {
            console.debug(error)
            saveToSync(action, note)
        }
    }

    const createBackup = async (note) => {
        const noteId = note.id
        const fileName = 'note-' + noteId

        try {
            const { success, id } = await multipartUpload(note, fileName)

            if (success && id) {
                const backup = {
                    ...notesBackup,
                    [noteId]: id
                }

                setNotesBackup(backup)
                await setItem(STORAGE_KEYS.NOTES_BACKUP, JSON.stringify(backup))
            }
        } catch (error) {
            console.log('error creating backup', error)
        }
    }

    const updateBackup = async (note) => {
        const noteId = note.id
        const id = notesBackup[noteId]

        if (id) {
            try {
                await updateFile(note, id)
            } catch (error) {
                console.log('error updating backup', error)
            }
        } else {
            await createBackup(note)
        }
    }

    const deleteBackup = async (noteId) => {
        const id = notesBackup[noteId]

        if (id) {
            try {
                await deleteFile(id)
            } catch (error) {
                console.log('error deleting backup', error)
            }
        }
    }

    const saveToSync = async (action, note) => {
        const sync = [...notesToSync, { action, note }]
        await setItem(STORAGE_KEYS.NOTES_TO_SYNC, JSON.stringify(sync))
        setNotesToSync(sync)
    }

    return { backup }
}
