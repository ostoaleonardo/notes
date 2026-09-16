import { useTranslation } from 'react-i18next'
import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'

import { useNotes } from './use-notes'
import { useLanguage } from './use-language'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { getNotesAsString } from '@/utils/files'

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

            showSnackbar(t('message.notes.exported'))
        } catch (error) {
            console.log(error)
        }
    }

    const shareFile = async (id) => {
        const note = getNote(id)
        const { fileName, fileContent } = getFileBackup(note)

        try {
            let file = new File(Paths.cache, fileName)
            if (file.exists) file.create({ overwrite: true })

            file = Paths.cache.createFile(fileName, 'text/markdown')
            file.write(fileContent)

            await Sharing.shareAsync(file.uri, { mimeType: 'text/markdown' })
        } catch (error) {
            console.log(error)
        }
    }

    const getFileBackup = (note) => ({
        fileName: 'note-' + note.id.split('-')[0] + '.md',
        fileContent: getNotesAsString([note], currentLanguage)
    })

    return { exportFile, shareFile }
}