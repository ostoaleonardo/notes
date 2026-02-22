import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Directory, File } from 'expo-file-system'
import { useNotes } from './use-notes'
import { useLanguage } from './use-language'
import { getNotesAsJson, getNotesAsString } from '@/utils'

export function useFiles() {
    const { t } = useTranslation()
    const { getNote } = useNotes()
    const { currentLanguage } = useLanguage()

    const exportFile = async (id) => {
        const note = getNote(id)
        const { fileName, fileContent } = getFileBackup(note)

        try {
            const directory = await Directory.pickDirectoryAsync()
            let file = new File(directory.uri, fileName)

            if (file.exists) {
                file.create({ overwrite: true })
            }

            file = directory.createFile(fileName, 'text/markdown')
            file.write(fileContent)

            ToastAndroid.show(t('message.notes.exported'), ToastAndroid.SHORT)
        } catch (error) {
            console.log(error)
        }
    }

    const getFileBackup = (note, type = 'md') => {
        const fileName = 'note-' + note.id.split('-')[0]

        switch (type) {
            case 'json':
                return {
                    fileName: fileName + '.json',
                    fileContent: JSON.stringify(getNotesAsJson(note))
                }
            case 'md':
                return {
                    fileName: fileName + '.md',
                    fileContent: getNotesAsString([note], currentLanguage)
                }
            default:
                return null
        }
    }

    return { exportFile }
}