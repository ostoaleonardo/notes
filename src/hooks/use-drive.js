import { useContext } from 'react'
import { AuthContext } from '@/context'
import { CONTENT_TYPE, GOOGLE_APIS, UPLOAD_TYPES } from '@/constants'
import { getMultipartRequestBody } from '@/utils'

export function useDrive() {
    const { accessToken } = useContext(AuthContext)

    const multipartUpload = async (data, fileName) => {
        try {
            validate(data)

            if (!fileName) {
                throw Error('Invalid file name')
            }

            const metadata = {
                name: fileName + '.json',
                parents: ['appDataFolder']
            }

            const url = new URL(GOOGLE_APIS.UPLOAD)
            const params = new URLSearchParams({
                uploadType: UPLOAD_TYPES.MULTIPART
            })

            url.search = params.toString()

            const requestBody = getMultipartRequestBody(metadata, data)

            const { id } = await fetch(url, {
                method: 'POST',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': CONTENT_TYPE
                }),
                body: requestBody
            })
                .then(response => response.json())

            console.debug('saved in', id)
            return { success: true, id }
        } catch (error) {
            getError(error)
        }
    }

    const updateFile = async (data, fileId) => {
        try {
            validate(data)

            if (!fileId) {
                throw Error('Invalid file id')
            }

            const url = new URL(GOOGLE_APIS.UPLOAD + '/' + fileId)
            const params = new URLSearchParams({
                uploadType: UPLOAD_TYPES.SIMPLE
            })

            url.search = params.toString()

            const { id } = await fetch(url, {
                method: 'PATCH',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                }),
                body: JSON.stringify(data)
            })
                .then(response => response.json())

            console.debug('updated in', id)
            return { success: true, id: id }
        } catch (error) {
            getError(error)
        }
    }

    const deleteFile = async (fileId) => {
        try {
            if (!fileId) {
                throw Error('Invalid file id')
            }

            const url = new URL(GOOGLE_APIS.FILES + '/' + fileId)

            const success = await fetch(url, {
                method: 'DELETE',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.ok)

            console.debug('deleted', fileId)
            return success
        } catch (error) {
            getError(error)
        }
    }

    const listFiles = async (query) => {
        try {
            if (!accessToken) {
                throw Error('No access token available')
            }

            if (!query) {
                throw Error('No query provided')
            }

            const url = new URL(GOOGLE_APIS.FILES)
            const params = new URLSearchParams({
                spaces: 'appDataFolder',
                q: query
            })

            url.search = params.toString()

            const { files } = await fetch(url, {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            console.debug('files count', files.length)
            return { success: true, files }
        } catch (error) {
            getError(error)
        }
    }

    const getFile = async (fileId) => {
        try {
            if (!accessToken) {
                throw Error('No access token available')
            }

            if (!fileId) {
                throw Error('Invalid file id')
            }

            const url = new URL(GOOGLE_APIS.FILES + '/' + fileId)
            const params = new URLSearchParams({
                alt: 'media'
            })

            url.search = params.toString()

            const response = await fetch(url, {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            console.debug('file', response.id)
            return response
        } catch (error) {
            getError(error)
        }
    }

    const getPageToken = async () => {
        try {
            if (!accessToken) {
                throw Error('No access token available')
            }

            const { startPageToken } = await fetch(GOOGLE_APIS.CHANGES + '/startPageToken', {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            return {
                success: true,
                startPageToken
            }
        } catch (error) {
            getError(error)
        }
    }

    const listChanges = async (pageToken) => {
        try {
            if (!accessToken) {
                throw Error('No access token available')
            }

            const url = new URL(GOOGLE_APIS.CHANGES)
            const params = new URLSearchParams({
                spaces: 'appDataFolder',
                pageToken
            })

            url.search = params.toString()

            const { changes, newStartPageToken } = await fetch(url, {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
                })
            })
                .then(response => response.json())

            return {
                success: true,
                newStartPageToken,
                changes
            }
        } catch (error) {
            getError(error)
        }
    }

    const validate = (data) => {
        if (!accessToken) {
            throw Error('No access token available')
        }

        if (!data) {
            throw Error('No data provided to upload')
        }
    }

    const getError = (error) => {
        console.error(error)

        return {
            success: false,
            error: error?.message || error
        }
    }

    return {
        multipartUpload,
        updateFile,
        deleteFile,
        listFiles,
        getFile,
        getPageToken,
        listChanges
    }
}
