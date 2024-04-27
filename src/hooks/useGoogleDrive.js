import { useContext } from 'react'
import { NoteContext } from '@/context'
import { GDrive, MimeTypes } from '@robinbobin/react-native-google-drive-api-wrapper'

export function useGoogleDrive() {
    const { notes } = useContext(NoteContext)

    const getFiles = async (token) => {
        const gdrive = new GDrive()
        gdrive.accessToken = token

        const files = await gdrive.files.list({
            q: "mimeType='application/json'",
            fields: 'files(id, name, size, mimeType)'
        })

        return files
    }

    const uploadFile = async (token) => {
        const gdrive = new GDrive()
        gdrive.accessToken = token

        const id = (await gdrive.files.newMultipartUploader()
            .setData(JSON.stringify(notes), MimeTypes.JSON)
            .setRequestBody({ name: 'notes.json' })
            .execute()
        ).id

        return id
    }

    return { uploadFile }
}
