import { useContext } from 'react'
import { AuthContext } from '@/context'
import { CLOSE_DELIMITER, DELIMITER, GOOGLE_APIS, MIME_TYPES, UPLOAD_TYPES } from '@/constants'

export function useGoogleDrive() {
    const { user } = useContext(AuthContext)
    const accessToken = user.accessToken

    const multipartUpload = async (data, fileName) => {
        const metadata = {
            name: fileName + '.json',
            parents: ['appDataFolder']
        }

        const metadataString = JSON.stringify(metadata)
        const contentString = JSON.stringify(data)

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

    const updateFile = async (data, fileId) => {
        try {
            const { id, error } = await fetch(GOOGLE_APIS.UPLOAD + '/' + fileId + UPLOAD_TYPES.SIMPLE, {
                method: 'PATCH',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(data)
            })
                .then(response => response.json())

            return { id, error }
        } catch (error) {
            return { error }
        }
    }

    const deleteFile = async (fileId) => {
        try {
            const response = await fetch(GOOGLE_APIS.FILES + '/' + fileId, {
                method: 'DELETE',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            return response
        } catch (error) {
            return null
        }
    }

    const listFiles = async (accessToken, query) => {
        try {
            const { files, error } = await fetch(GOOGLE_APIS.FILES + '?spaces=appDataFolder&q=' + query, {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            if (error) {
                return []
            }

            return files
        } catch (error) {
            return []
        }
    }

    const getFile = async (accessToken, fileId) => {
        try {
            const response = await fetch(GOOGLE_APIS.FILES + '/' + fileId + '?alt=media', {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            return response
        } catch (error) {
            return null
        }
    }

    return {
        multipartUpload,
        updateFile,
        deleteFile,
        listFiles,
        getFile
    }
}
