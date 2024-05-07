import { useContext, useEffect } from 'react'
import { GDrive, MimeTypes } from '@robinbobin/react-native-google-drive-api-wrapper'
import { AuthContext, SyncContext } from '@/context'
import { useStorage } from './useStorage'
import { STORAGE_KEYS } from '@/constants'

export function useGoogleDrive() {
    const { user } = useContext(AuthContext)
    const { lastSync, setLastSync, isSyncing, setIsSyncing } = useContext(SyncContext)
    const { setItem, getItem } = useStorage()

    const accessToken = user.accessToken

    const uploadBackup = async (backupKey, fileName, backupData) => {
        try {
            setIsSyncing(true)
            const backupId = await getItem(backupKey)
            const fileId = backupId ? backupId : await getBackupFileId(accessToken, fileName)

            if (fileId) {
                await replaceFile(accessToken, backupData, fileId)
            } else {
                await uploadFile(accessToken, fileName, backupData, backupKey)
            }
        } catch (error) {
            // Handle error
        } finally {
            setIsSyncing(false)
        }
    }

    const uploadFile = async (accessToken, fileName, backupData, backupId) => {
        const gdrive = new GDrive()
        gdrive.accessToken = accessToken

        try {
            const { id } = await gdrive.files.newMultipartUploader()
                .setRequestBody({
                    name: fileName,
                    parents: ['appDataFolder']
                })
                .setData(backupData, MimeTypes.JSON)
                .execute()

            if (id) {
                saveLastSync()
                await setItem(backupId, id)
            }

            return id
        } catch (error) {
            return null
        }
    }

    const replaceFile = async (accessToken, backupData, fileId) => {
        const gdrive = new GDrive()
        gdrive.accessToken = accessToken

        try {
            const response = await gdrive.files.newMultipartUploader()
                .setData(backupData, MimeTypes.JSON)
                .setIdOfFileToUpdate(fileId)
                .execute()

            if (response) {
                saveLastSync()
            }
        } catch (error) {
            // Handle error
        }
    }

    const getBackupFileId = async (accessToken, fileName) => {
        const gdrive = new GDrive()
        gdrive.accessToken = accessToken

        try {
            const { files } = await gdrive.files.list({
                q: `name = "${fileName}"`,
                spaces: 'appDataFolder',
                fields: 'files(id, name, size, mimeType)'
            })

            if (files.length > 0) {
                return files[0].id
            }

            return null
        } catch (error) {
            return null
        }
    }

    const downloadBackup = async (accessToken, backupKey, fileName) => {
        const gdrive = new GDrive()
        gdrive.accessToken = accessToken

        try {
            const backupId = await getItem(backupKey)
            const fileId = backupId ? backupId : await getBackupFileId(accessToken, fileName)

            if (fileId) {
                const data = await gdrive.files.getJson(fileId)
                return data
            }

            return null
        } catch (error) {
            return null
        }
    }

    const saveLastSync = async () => {
        const lastSync = new Date().toISOString()
        await setItem(STORAGE_KEYS.LAST_SYNC, lastSync)
        setLastSync(lastSync)
    }

    useEffect(() => {
        (async () => {
            const lastSync = await getItem(STORAGE_KEYS.LAST_SYNC)
            setLastSync(lastSync)
        })()
    }, [])

    return {
        uploadBackup,
        downloadBackup,
        lastSync,
        isSyncing
    }
}
