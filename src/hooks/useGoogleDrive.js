import { useContext } from 'react'
import { AuthContext } from '@/context'
import { getMultipartRequestBody } from '@/utils'
import { GOOGLE_APIS, UPLOAD_TYPES } from '@/constants'

export function useGoogleDrive() {
    const { accessToken } = useContext(AuthContext)

    const multipartUpload = async (data, fileName) => {
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

        try {
            const { id } = await fetch(url, {
                method: 'POST',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'multipart/related; boundary=foo_bar_baz',
                }),
                body: requestBody
            })
                .then(response => response.json())

            return { id }
        } catch (error) {
            return error
        }
    }

    const updateFile = async (data, fileId) => {
        const url = new URL(GOOGLE_APIS.UPLOAD + '/' + fileId)
        const params = new URLSearchParams({
            uploadType: UPLOAD_TYPES.SIMPLE
        })

        url.search = params.toString()

        try {
            const { id, error } = await fetch(url, {
                method: 'PATCH',
                headers: new Headers({
                    Authorization: 'Bearer ' + accessToken
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
        const url = new URL(GOOGLE_APIS.FILES)
        const params = new URLSearchParams({
            spaces: 'appDataFolder',
            q: query
        })

        url.search = params.toString()

        try {
            const { files, error } = await fetch(url, {
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
        const url = new URL(GOOGLE_APIS.FILES + '/' + fileId)
        const params = new URLSearchParams({
            alt: 'media'
        })

        url.search = params.toString()

        try {
            const response = await fetch(url, {
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
