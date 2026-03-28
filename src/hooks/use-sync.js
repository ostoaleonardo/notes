import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastAndroid } from 'react-native'
import { useDrive } from './use-drive'
import { useStorage } from './use-storage'
import { AuthContext, NoteContext } from '@/context'
import { SyncContext } from '@/context/sync-context'
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from '@/constants'

export function useSync() {
    const { t } = useTranslation()
    const { setItem, getItem } = useStorage()

    const { accessToken } = useContext(AuthContext)

    const {
        setIsSyncing,
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
            console.log('start restoring...')

            const { success: categoriesSuccess, files: categoriesFiles } = await listFiles('name="categories.json"')

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

            const { success: notesSuccess, files: notesFiles } = await listFiles('name contains "note"')

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

    const sync = async () => {
        try {
            console.debug('syncing...')
            const pageToken = await initPageToken()

            const { success, changes, newStartPageToken } = await listChanges(pageToken)
            console.debug('changes', changes)

            if (success && changes.length) {
                let changesApplied = false
                let newNotes = JSON.parse(await getItem(STORAGE_KEYS.NOTES))
                let newCategories = JSON.parse(await getItem(STORAGE_KEYS.CATEGORIES))
                let notesBackup = JSON.parse(await getItem(STORAGE_KEYS.NOTES_BACKUP))

                for (const change of changes) {
                    const { fileId } = change
                    const { name } = change.file || {}

                    if (change.removed) {
                        const noteId = Object.keys(notesBackup).find((key) => notesBackup[key] === fileId)

                        if (noteId) {
                            newNotes = newNotes.filter((note) => note.id !== noteId)
                            delete notesBackup[noteId]
                            changesApplied = true
                        }
                    } else {
                        if (name === 'categories.json') {
                            newCategories = await getFile(fileId)
                            changesApplied = true
                        }

                        if (name.includes('note')) {
                            const note = await getFile(fileId)

                            if (notesBackup[note.id]) {
                                newNotes.forEach((n, i) => {
                                    if (n.id === note.id) {
                                        newNotes[i] = note
                                    }
                                })
                            } else {
                                newNotes.push(note)
                                notesBackup[note.id] = fileId
                            }

                            changesApplied = true
                        }

                    }
                }

                if (changesApplied) {
                    setNotes(newNotes)
                    setCategories(newCategories)
                    await setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes))
                    await setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories))
                    await setItem(STORAGE_KEYS.PAGE_TOKEN, newStartPageToken)
                }
            }
        } catch (error) {
            // Handle error
        }
    }

    return {
        sync,
        restore,
        schedule
    }
}
