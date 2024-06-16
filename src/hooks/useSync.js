import { useContext, useEffect } from 'react'
import { useGoogleDrive } from './useGoogleDrive'
import { useStorage } from './useStorage'
import { NoteContext, SyncContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useSync() {
    const { isSyncing, setIsSyncing } = useContext(SyncContext)
    const { setNotes, setCategories } = useContext(NoteContext)
    const { getPageToken, listChanges, getFile } = useGoogleDrive()
    const { setItem, getItem } = useStorage()

    const initPageToken = async () => {
        let pageToken = await getItem(STORAGE_KEYS.PAGE_TOKEN)

        if (!pageToken) {
            const startPageToken = await getPageToken()

            if (startPageToken) {
                pageToken = startPageToken
                await setItem(STORAGE_KEYS.PAGE_TOKEN, startPageToken)
            }
        }

        return pageToken
    }

    const sync = async () => {
        try {
            const pageToken = await initPageToken()

            const { changes, newStartPageToken } = await listChanges(pageToken)

            if (changes.length) {
                let changesApplied = false
                let newNotes = JSON.parse(await getItem(STORAGE_KEYS.NOTES))
                let newCategories = JSON.parse(await getItem(STORAGE_KEYS.CATEGORIES))
                let notesIdBackup = JSON.parse(await getItem(STORAGE_KEYS.NOTES_ID_BACKUP))

                for (const change of changes) {
                    const { fileId } = change
                    const { name } = change.file || {}

                    if (change.removed) {
                        const noteId = Object.keys(notesIdBackup).find((key) => notesIdBackup[key] === fileId)

                        if (noteId) {
                            newNotes = newNotes.filter((note) => note.id !== noteId)
                            delete notesIdBackup[noteId]
                            changesApplied = true
                        }
                    } else {
                        if (name === 'categories.json') {
                            newCategories = await getFile(fileId)
                            changesApplied = true
                        }

                        if (name.includes('note')) {
                            const note = await getFile(fileId)

                            if (notesIdBackup[note.id]) {
                                newNotes.forEach((n, i) => {
                                    if (n.id === note.id) {
                                        newNotes[i] = note
                                    }
                                })
                            } else {
                                newNotes.push(note)
                                notesIdBackup[note.id] = fileId
                            }

                            changesApplied = true
                        }

                    }
                }

                // Update changes
                if (changesApplied) {
                    setNotes(newNotes)
                    await setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes))
                    setCategories(newCategories)
                    await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories))
                    await setItem(STORAGE_KEYS.PAGE_TOKEN, newStartPageToken)
                }
            }
        } catch (error) {
            // Handle error
        }
    }

    // Sync every 15 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isSyncing) return

            try {
                setIsSyncing(true)
                await sync()
            } catch (error) {
                // Handle error
            } finally {
                setIsSyncing(false)
            }
        }, 15000)

        return () => clearInterval(interval)
    }, [isSyncing])

    // useeffect to get the page token on first load
    useEffect(() => {
        (async () => {
            await initPageToken()
        })()
    }, [])

    return {
        isSyncing,
        setIsSyncing,
        sync
    }
}
