import { useEffect, useState } from 'react'
import { SyncContext } from './sync-context-base'
import { useStorage } from '../hooks/use-storage'
import { STORAGE_KEYS } from '@/constants'

export function SyncProvider({ children }) {
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncType, setSyncType] = useState('')
    const [notesToSync, setNotesToSync] = useState([])
    const [notesBackup, setNotesBackup] = useState({})
    const [categoriesFile, setCategoriesFile] = useState('')

    const { getItem } = useStorage()

    useEffect(() => {
        const getBackupInfo = async () => {
            const notesBackup = await getItem(STORAGE_KEYS.NOTES_BACKUP)
            const notesToSync = await getItem(STORAGE_KEYS.NOTES_TO_SYNC)
            const categoriesFileId = await getItem(STORAGE_KEYS.CATEGORIES_FILE_ID)

            if (notesBackup) {
                setNotesBackup(JSON.parse(notesBackup))
            }

            if (notesToSync) {
                setNotesToSync(JSON.parse(notesToSync))
            }

            setCategoriesFile(categoriesFileId)
        }

        getBackupInfo()
    }, [])

    return (
        <SyncContext.Provider
            value={{
                isSyncing,
                setIsSyncing,
                syncType,
                setSyncType,
                notesToSync,
                setNotesToSync,
                notesBackup,
                setNotesBackup,
                categoriesFile,
                setCategoriesFile
            }}
        >
            {children}
        </SyncContext.Provider>
    )
}
