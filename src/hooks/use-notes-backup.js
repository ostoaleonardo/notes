import { useDrive } from './use-drive'

export function useNotesBackup() {
    const {
        multipartUpload,
        updateFile,
        deleteFile
    } = useDrive()

    const backup = async (action, note, fileId) => {
        try {
            switch (action) {
                case 'create':
                    return await createBackup(note)
                case 'update':
                    await updateBackup(note, fileId)
                    break
                case 'delete':
                    await deleteBackup(fileId)
                    break
                default:
                    break
            }
        } catch (error) {
            throw error
        }
    }

    const createBackup = async (note) => {
        try {
            const fileName = 'note-' + note.id
            return await multipartUpload(note, fileName)
        } catch (error) {
            console.log('error creating backup')
            throw error
        }
    }

    const updateBackup = async (note, fileId) => {
        try {
            await updateFile(note, fileId)
        } catch (error) {
            console.log('error updating backup')
            throw error
        }
    }

    const deleteBackup = async (fileId) => {
        try {
            await deleteFile(fileId)
        } catch (error) {
            console.log('error deleting backup')
            throw error
        }
    }

    return { backup }
}
