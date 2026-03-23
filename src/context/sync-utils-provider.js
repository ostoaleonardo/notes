import { createContext, useContext, useEffect, useRef } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { NoteContext } from './note-context'
import { SyncContext } from './sync-context'
import { useNotesBackup } from '@/hooks/use-notes-backup'

export const SyncUtilsContext = createContext()

export function SyncUtilsProvider({ children }) {
    const { backup } = useNotesBackup()
    const { isInternetReachable } = useNetInfo()
    const { notes } = useContext(NoteContext)

    const {
        setIsSyncing,
        notesToSync,
        setNotesToSync
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

        for (const { action, id } of queue) {
            try {
                const note = notes.find(note => note.id === id) || { id }

                await backup(action, note)
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

        console.debug('sync finished...')
        syncing.current = false
        setIsSyncing(false)
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
