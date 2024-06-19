import { useContext, useEffect } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { useGoogleDrive } from './useGoogleDrive'
import { useStorage } from './useStorage'
import { useSync } from './useSync'
import { NoteContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useNotesBackup() {
    const { isConnected } = useNetInfo()
    const { setItem, getItem } = useStorage()
    const { multipartUpload, updateFile, deleteFile } = useGoogleDrive()
    const { isSyncing, setIsSyncing } = useSync()
    const { notesToSync, setNotesToSync, notesIdBackup, setNotesIdBackup } = useContext(NoteContext)

    const backup = async (action, note) => {
        try {
            setIsSyncing(true)

            if (isConnected) {
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
            } else {
                saveToSync(action, note)
            }
        } catch (error) {
            saveToSync(action, note)
        }
        finally {
            setIsSyncing(false)
        }
    }

    const createBackup = async (note) => {
        const noteId = note.id
        const fileName = 'note-' + noteId

        try {
            const { id } = await multipartUpload(note, fileName)

            const newNotesIdBackup = {
                ...notesIdBackup,
                [noteId]: id
            }

            if (id) {
                setNotesIdBackup(newNotesIdBackup)
                await setItem(STORAGE_KEYS.NOTES_ID_BACKUP, JSON.stringify(newNotesIdBackup))
            }
        } catch (error) {
            console.log('error creating backup', error)
        }
    }

    const updateBackup = async (note) => {
        const noteId = note.id
        const id = notesIdBackup[noteId]

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
        const id = notesIdBackup[noteId]

        if (id) {
            try {
                await deleteFile(id)
            } catch (error) {
                console.log('error deleting backup', error)
            }
        }
    }

    const saveToSync = async (action, note) => {
        const newNotesToSync = [...notesToSync, { action, note }]
        await setItem(STORAGE_KEYS.NOTES_TO_SYNC, JSON.stringify(newNotesToSync))
        setNotesToSync(newNotesToSync)
    }

    const syncNotes = async () => {
        try {
            if (isSyncing) return

            for (const { action, note } of notesToSync) {
                await backup(action, note)
            }

            setNotesToSync([])
            await setItem(STORAGE_KEYS.NOTES_TO_SYNC, JSON.stringify([]))
        } catch (error) {
            // Handle error
        }
    }

    useEffect(() => {
        (async () => {
            const idBackup = await getItem(STORAGE_KEYS.NOTES_ID_BACKUP)
            const notesToSync = await getItem(STORAGE_KEYS.NOTES_TO_SYNC)

            if (idBackup) {
                setNotesIdBackup(JSON.parse(idBackup))
            }

            if (notesToSync) {
                setNotesToSync(JSON.parse(notesToSync))
            }
        })()
    }, [])

    useEffect(() => {
        if (isConnected && notesToSync.length) {
            syncNotes()
        }
    }, [isConnected, notesToSync])

    return {
        backup,
        isSyncing
    }
}
