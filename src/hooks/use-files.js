import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Directory, File } from 'expo-file-system'
import { useNotes } from './use-notes'
import { useLanguage } from './use-language'
import { getNotesAsString } from '@/utils'

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

    const getFileBackup = (note) => ({
        fileName: 'note-' + note.id.split('-')[0] + '.md',
        fileContent: getNotesAsString([note], currentLanguage)
    })

    return { exportFile }
}