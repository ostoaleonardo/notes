import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastAndroid } from 'react-native'
import { useDrive } from './use-drive'
import { useStorage } from './use-storage'
import { AuthContext } from '../context/auth-context'
import { NoteContext } from '../context/note-context'
import { SyncContext } from '../context/sync-context-base'
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '@/constants'

export function useSync() {
    const { t } = useTranslation()
    const { setItem, getItem } = useStorage()

    const { accessToken } = useContext(AuthContext)

    const {
        setIsSyncing,
        setSyncType,
        setNotesBackup,
        setCategoriesFile,
        schedule
    } = useContext(SyncContext)

    const {
        setNotes,
        setCategories
    } = useContext(NoteContext)

    const {
        listFiles,
        getPageToken,
        listChanges,
        getFile
    } = useDrive(accessToken)

    const restore = async () => {
        try {
            setIsSyncing(true)
            setSyncType('download')
            console.log('start restoring...')

            const {
                success: categoriesSuccess,
                files: categoriesFiles
            } = await listFiles('name="categories.json"')

            if (categoriesSuccess && categoriesFiles.length) {
                const categoriesFile = categoriesFiles[0].id
                const categories = await getFile(categoriesFile)

                setCategories(categories)
                setCategoriesFile(categoriesFile)
                await setItem(STORAGE_KEYS.CATEGORIES_FILE_ID, categoriesFile)
                await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
            } else {
                await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES))
            }

            const {
                success: notesSuccess,
                files: notesFiles
            } = await listFiles('name contains "note"')

            const notes = []
            const backup = {}

            if (notesSuccess && notesFiles) {
                for (const { id } of notesFiles) {
                    const file = await getFile(id)
                    backup[file.id] = id
                    notes.push(file)
                }
            }

            setNotes(notes)
            setNotesBackup(backup)
            await setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
            await setItem(STORAGE_KEYS.NOTES_BACKUP, JSON.stringify(backup))

            console.log('finished restore...')
            ToastAndroid.show(t('sync.completed'), ToastAndroid.SHORT)
        } catch (error) {
            console.log(error)
            ToastAndroid.show(t('sync.error'), ToastAndroid.SHORT)
        } finally {
            setIsSyncing(false)
            setSyncType('')
        }
    }

    const sync = async () => {
        try {
            setIsSyncing(true)
            setSyncType('download')

            const pageToken = await initPageToken()
            console.debug('page token', pageToken)

            const { success, changes, newStartPageToken } = await listChanges(pageToken)
            if (!success || !changes?.length) return

            console.debug('syncing...')

            let notesBackup = JSON.parse(await getItem(STORAGE_KEYS.NOTES_BACKUP)) || {}
            let currentNotes = JSON.parse(await getItem(STORAGE_KEYS.NOTES)) || []
            let notesMap = new Map(currentNotes.map(note => [note.id, note]))
            let notesChanged = false
            let categoriesChanged = false
            let newCategories = null

            for (const change of changes) {
                const fileId = change?.fileId
                const name = change?.file?.name

                if (name === 'categories.json') {
                    newCategories = await getFile(fileId)
                    categoriesChanged = true
                    continue
                }

                if (change.removed) {
                    const noteId = Object.keys(notesBackup).find((key) => notesBackup[key] === fileId)

                    if (noteId) {
                        notesMap.delete(noteId)
                        delete notesBackup[noteId]
                        notesChanged = true
                    }
                } else {
                    const note = await getFile(fileId)

                    if (notesBackup[note.id]) {
                        notesMap.set(note.id, note)
                    } else {
                        notesMap.set(note.id, note)
                        notesBackup[note.id] = fileId
                    }

                    notesChanged = true
                }
            }

            if (categoriesChanged && newCategories) {
                setCategories(newCategories)
                await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories))
            }

            if (notesChanged) {
                const mergedNotes = Array.from(notesMap.values())
                setNotes(mergedNotes)
                await setItem(STORAGE_KEYS.NOTES, JSON.stringify(mergedNotes))
                await setItem(STORAGE_KEYS.NOTES_BACKUP, JSON.stringify(notesBackup))
            }

            if (categoriesChanged || notesChanged) {
                await setItem(STORAGE_KEYS.PAGE_TOKEN, newStartPageToken)
            }
        } catch (error) {
            console.debug('sync error', error)
        } finally {
            setIsSyncing(false)
            setSyncType('')
        }
    }

    const initPageToken = async () => {
        let pageToken = await getItem(STORAGE_KEYS.PAGE_TOKEN)

        if (!pageToken) {
            const { success, startPageToken } = await getPageToken()

            if (success) {
                pageToken = startPageToken
                await setItem(STORAGE_KEYS.PAGE_TOKEN, startPageToken)
            }
        }

        if (!pageToken) {
            throw Error('No page token available')
        }

        return pageToken
    }

    return { sync, restore, schedule }
}
