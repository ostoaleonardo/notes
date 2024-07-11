import { useContext, useEffect } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { useGoogleDrive } from './useGoogleDrive'
import { useStorage } from './useStorage'
import { useAuth } from './useAuth'
import { NoteContext, SyncContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useNotesBackup() {
    const { isInternetReachable } = useNetInfo()
    const { setItem, getItem } = useStorage()
    const { multipartUpload, updateFile, deleteFile } = useGoogleDrive()
    const { isSignedIn } = useAuth()
    const { isSyncing, setIsSyncing, isBackingUp, setIsBackingUp } = useContext(SyncContext)
    const { notesToSync, setNotesToSync, notesIdBackup, setNotesIdBackup } = useContext(NoteContext)

    const backup = async (action, note) => {
        if (!isSignedIn) return
        let success = false

        try {
            setIsSyncing(true)

            if (isInternetReachable) {
                switch (action) {
                    case 'create':
                        success = await createBackup(note)
                        break
                    case 'update':
                        success = await updateBackup(note)
                        break
                    case 'delete':
                        success = await deleteBackup(note.id)
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
            return success
        }
    }

    const createBackup = async (note) => {
        const noteId = note.id
        const fileName = 'note-' + noteId

        try {
            const { id, error } = await multipartUpload(note, fileName)

            if (error) {
                throw new Error(error.message)
            }

            if (id) {
                const newNotesIdBackup = {
                    ...notesIdBackup,
                    [noteId]: id
                }

                updateNotesIdBackup(newNotesIdBackup)
            }

            return true
        } catch (error) {
            return false
        }
    }

    const updateBackup = async (note) => {
        const noteId = note.id
        const id = notesIdBackup[noteId]

        if (id) {
            try {
                const { error } = await updateFile(note, id)

                if (error) {
                    throw new Error(error.message)
                }

                return true
            } catch (error) {
                return false
            }
        } else {
            await createBackup(note)
        }
    }

    const deleteBackup = async (noteId) => {
        const id = notesIdBackup[noteId]

        if (id) {
            try {
                const success = await deleteFile(id)

                if (success) {
                    const newNotesIdBackup = { ...notesIdBackup }
                    delete newNotesIdBackup[noteId]

                    updateNotesIdBackup(newNotesIdBackup)
                }

                return success
            } catch (error) {
                return false
            }
        }
    }

    const saveToSync = async (action, note) => {
        const newNotesToSync = [...notesToSync, { action, note }]
        await setItem(STORAGE_KEYS.NOTES_TO_SYNC, JSON.stringify(newNotesToSync))
        setNotesToSync(newNotesToSync)
    }

    const updateNotesIdBackup = async (newNotesIdBackup) => {
        setNotesIdBackup(newNotesIdBackup)
        await setItem(STORAGE_KEYS.NOTES_ID_BACKUP, JSON.stringify(newNotesIdBackup))
    }

    const syncNotes = async () => {
        if (!isSignedIn) return

        try {
            setIsBackingUp(true)
            const newNotesToSync = []

            for (const { action, note } of notesToSync) {
                const success = await backup(action, note)

                if (!success) {
                    newNotesToSync.push({ action, note })
                }
            }

            setNotesToSync(newNotesToSync)
            await setItem(STORAGE_KEYS.NOTES_TO_SYNC, JSON.stringify(newNotesToSync))
        } catch (error) {
            // Handle error
        } finally {
            setIsBackingUp(false)
        }
    }

    useEffect(() => {
        (async () => {
            const notesIdBackup = await getItem(STORAGE_KEYS.NOTES_ID_BACKUP)
            const notesToSync = await getItem(STORAGE_KEYS.NOTES_TO_SYNC)

            if (notesIdBackup) {
                setNotesIdBackup(JSON.parse(notesIdBackup))
            }

            if (notesToSync) {
                setNotesToSync(JSON.parse(notesToSync))
            }
        })()
    }, [])

    useEffect(() => {
        if (isInternetReachable && notesToSync.length > 0 && !isBackingUp) {
            const timer = setTimeout(() => {
                syncNotes()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [isInternetReachable, notesToSync, isBackingUp])

    return {
        backup,
        isSyncing
    }
}
