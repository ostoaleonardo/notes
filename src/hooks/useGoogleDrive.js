import { useContext } from 'react'
import { AuthContext, SyncContext } from '@/context'
import { useStorage } from './useStorage'
import { CLOSE_DELIMITER, DELIMITER, GOOGLE_APIS, MIME_TYPES } from '@/constants'
import { UPLOAD_TYPES } from '@/constants/drive'

export function useGoogleDrive() {
    const { user } = useContext(AuthContext)
    const { isSyncing, setIsSyncing } = useContext(SyncContext)
    const { getItem } = useStorage()

    const accessToken = user.accessToken

    const uploadBackup = async (backupData, fileId) => {
        try {
            setIsSyncing(true)

            if (fileId) {
                console.log('replacing file...')
                const response = await replaceFile(accessToken, backupData, fileId)
                return response
            } else {
                console.log('uploading file...')
                const response = await multipartUpload(accessToken, backupData)
                return response
            }
        } catch (error) {
            console.log('error uploading file', error)
            return error
        } finally {
            setIsSyncing(false)
        }
    }

    const multipartUpload = async (accessToken, backupData) => {
        const { id } = backupData

        const metadata = {
            name: 'note-' + id + '.json',
            // parents: ['appDataFolder']
        }

        const metadataString = JSON.stringify(metadata)
        const contentString = JSON.stringify(backupData)

        const multipartRequestBody =
            DELIMITER +
            'Content-Type: ' + MIME_TYPES.JSON + '\r\n\r\n' +
            metadataString +
            DELIMITER +
            'Content-Type: ' + MIME_TYPES.JSON + '\r\n\r\n' +
            contentString +
            CLOSE_DELIMITER

        try {
            const { id } = await fetch(GOOGLE_APIS.UPLOAD + UPLOAD_TYPES.MULTIPART, {
                method: 'POST',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'multipart/related; boundary=foo_bar_baz',
                }),
                body: multipartRequestBody
            })
                .then(response => response.json())

            return { id }
        } catch (error) {
            return error
        }
    }

    const replaceFile = async (accessToken, backupData, fileId) => {
        try {
            const { id, error } = await fetch(GOOGLE_APIS.UPLOAD + '/' + fileId + UPLOAD_TYPES.SIMPLE, {
                method: 'PATCH',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(backupData)
            })
                .then(response => response.json())

            return { id, error }
        } catch (error) {
            return { error }
        }
    }

    const searchFile = async (accessToken, fileName) => {
        try {
            const response = await fetch(`${GOOGLE_APIS.FILES_LIST}?q=name="${fileName}"`, {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            console.log(response)
        } catch (error) {
            return null
        }
    }

    const downloadBackup = async (accessToken, backupKey, fileName) => {
        try {
            // TODO
        } catch (error) {
            return null
        }
    }

    return {
        uploadBackup,
        downloadBackup,
        isSyncing
    }
}
