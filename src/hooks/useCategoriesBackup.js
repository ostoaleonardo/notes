import { useContext, useEffect, useState } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { useGoogleDrive } from './useGoogleDrive'
import { useStorage } from './useStorage'
import { SyncContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useCategoriesBackup() {
    const { isInternetReachable } = useNetInfo()
    const { setItem, getItem } = useStorage()
    const { multipartUpload, updateFile } = useGoogleDrive()
    const { isSyncing, setIsSyncing } = useContext(SyncContext)
    const [fileId, setFileId] = useState(null)

    const backup = async (categories) => {
        try {
            setIsSyncing(true)

            if (isInternetReachable) {
                if (fileId) {
                    await updateBackup(categories)
                } else {
                    await createBackup(categories)
                }
            }
        } catch (error) {
            // Handle error
        }
        finally {
            setIsSyncing(false)
        }
    }

    const createBackup = async (categories) => {
        try {
            const { id } = await multipartUpload(categories, 'categories')

            if (id) {
                setFileId(id)
                await setItem(STORAGE_KEYS.CATEGORIES_FILE_ID, id)
            }
        } catch (error) {
            console.log('error creating backup', error)
        }
    }

    const updateBackup = async (categories) => {
        if (fileId) {
            try {
                await updateFile(categories, fileId)
            } catch (error) {
                console.log('error updating backup', error)
            }
        } else {
            await createBackup(note)
        }
    }

    useEffect(() => {
        (async () => {
            const fileId = await getItem(STORAGE_KEYS.CATEGORIES_FILE_ID)

            if (fileId) {
                setFileId(fileId)
            }
        })()
    }, [])

    return {
        backup,
        isSyncing
    }
}
