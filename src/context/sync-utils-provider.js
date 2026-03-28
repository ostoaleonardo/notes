import { createContext, useContext, useEffect, useRef } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { NoteContext } from './note-context'
import { SyncContext } from './sync-context'
import { useNotesBackup } from '@/hooks/use-notes-backup'
import { useStorage } from '@/hooks'
import { STORAGE_KEYS } from '@/constants'

export const SyncUtilsContext = createContext()

export function SyncUtilsProvider({ children }) {
    const { isInternetReachable } = useNetInfo()
    const { backup } = useNotesBackup()
    const { setItem } = useStorage()

    const { notes } = useContext(NoteContext)

    const {
        setIsSyncing,
        notesToSync,
        setNotesToSync,
        notesBackup,
        setNotesBackup
    } = useContext(SyncContext)

    const timer = useRef({})
    const syncing = useRef(false)

    const schedule = (action, id) => {
        if (timer.current[id]) {
            clearTimeout(timer.current[id])
        }

        timer.current[id] = setTimeout(() => {
            console.debug('schedule', action, 'for', id)

            enqueue(action, id)
            delete timer.current[id]
        }, 5000)
    }

    const enqueue = (action, id) => {
        setNotesToSync(prev => {
            const existing = prev.find(note => note.id === id)

            if (!existing) {
                return [...prev, { id, action }]
            }

            let newAction = existing.action

            if (existing.action === 'create' && action === 'delete') {
                return prev.filter(note => note.id !== id)
            }

            if (existing.action === 'create' && action === 'update') {
                newAction = 'create'
            }

            if (existing.action === 'update' && action === 'update') {
                newAction = 'update'
            }

            if (existing.action === 'update' && action === 'delete') {
                newAction = 'delete'
            }

            if (existing.action === 'delete' && action === 'create') {
                newAction = 'update'
            }

            return prev.map(note => note.id === id
                ? { ...note, action: newAction }
                : note
            )
        })
    }

    const processQueue = async () => {
        if (syncing.current) return
        if (notesToSync.length === 0) return

        console.debug('start syncing...')
        syncing.current = true
        setIsSyncing(true)

        const queue = [...notesToSync]
        const processed = new Set([])
        const failed = new Set([])
        const backups = []

        for (const { action, id } of queue) {
            try {
                const note = notes.find(note => note.id === id) || { id }

                // To update or delete file
                const fileId = getFileId(action, id)

                const response = await backup(action, note, fileId)

                // Only save file id for created notes
                if (response?.success && response?.id) {
                    backups.push({ [note.id]: response.id })
                }

                processed.add(id)
            } catch (error) {
                console.debug('sync error', error)
                failed.add(id)
            }
        }

        setNotesToSync(prev => {
            if (!prev?.length) return []

            return prev.filter(item => {
                if (failed.has(item.id)) return true
                if (!processed.has(item.id)) return true
                return false
            })
        })

        // Save file id for saved notes
        saveFilesId(backups)

        console.debug('sync finished...')
        syncing.current = false
        setIsSyncing(false)
    }

    const getFileId = (action, id) => {
        let fileId = ''

        if (action === 'update' || action === 'delete') {
            fileId = notesBackup[id]
        }

        return fileId
    }

    const saveFilesId = async (backups) => {
        if (!backups?.length) return

        const files = backups.reduce((acc, backup) => {
            return { ...acc, ...backup }
        }, {})

        const notesFilesId = {
            ...notesBackup,
            ...files
        }

        setNotesBackup(notesFilesId)
        await setItem(
            STORAGE_KEYS.NOTES_BACKUP,
            JSON.stringify(notesFilesId)
        )
    }

    useEffect(() => {
        if (!isInternetReachable) return
        if (!notesToSync?.length) return

        processQueue()
    }, [notesToSync, isInternetReachable])

    return (
        <SyncUtilsContext.Provider
            value={{ schedule }}
        >
            {children}
        </SyncUtilsContext.Provider>
    )
}
