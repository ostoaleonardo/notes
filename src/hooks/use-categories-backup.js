import { useContext } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { useStorage } from './use-storage'
import { useDrive } from './use-drive'
import { SyncContext } from '@/context'
import { STORAGE_KEYS } from '@/constants'

export function useCategoriesBackup(accessToken) {
    const { setItem } = useStorage()
    const { isInternetReachable } = useNetInfo()
    const { multipartUpload, updateFile } = useDrive(accessToken)

    const {
        setIsSyncing,
        categoriesFile,
        setCategoriesFile
    } = useContext(SyncContext)

    const backup = async (categories) => {
        try {
            setIsSyncing(true)

            if (!isInternetReachable) {
                throw Error('No internet connection')
            }

            if (categoriesFile) {
                await updateBackup(categories)
            } else {
                await createBackup(categories)
            }
        } catch (error) {
            console.log('error during backup', error)
        } finally {
            setIsSyncing(false)
        }
    }

    const createBackup = async (categories) => {
        try {
            const { success, id } = await multipartUpload(categories, 'categories')

            if (success && id) {
                setCategoriesFile(id)
                await setItem(STORAGE_KEYS.CATEGORIES_FILE_ID, id)
            }
        } catch (error) {
            console.log('error creating backup')
            throw error
        }
    }

    const updateBackup = async (categories) => {
        try {
            if (!categoriesFile) {
                throw Error('Invalid categories file id')
            }

            await updateFile(categories, categoriesFile)
        } catch (error) {
            console.log('error updating backup')
            throw error
        }
    }

    return { backup }
}
