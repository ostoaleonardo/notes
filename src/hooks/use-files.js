import { useTranslation } from 'react-i18next'
import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Print from 'expo-print'

import { useNotes } from './use-notes'
import { useLanguage } from './use-language'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { getNotesAsString } from '@/utils/files'
import { getNoteAsHtml } from '@/utils/export-html'

import { EXPORT_FORMATS, EXPORT_MIME_TYPES, EXPORT_EXTENSIONS } from '@/constants/export'

export function useFiles() {
    const { t } = useTranslation()
    const { getNote } = useNotes()
    const { currentLanguage } = useLanguage()

    const getFileName = (note, format) => `note-${note.id.split('-')[0]}.${EXPORT_EXTENSIONS[format]}`

    const getFileData = async (note, format) => {
        const fileName = getFileName(note, format)

        if (format === EXPORT_FORMATS.PDF) {
            const { uri } = await Print.printToFileAsync({ html: getNoteAsHtml(note) })
            return { fileName, fileData: await new File(uri).bytes() }
        }

        if (format === EXPORT_FORMATS.HTML) {
            return { fileName, fileData: getNoteAsHtml(note) }
        }

        return { fileName, fileData: getNotesAsString([note], currentLanguage) }
    }

    const exportFile = async (id, format = EXPORT_FORMATS.MARKDOWN) => {
        const note = getNote(id)

        try {
            const directory = await Directory.pickDirectoryAsync()
            const { fileName, fileData } = await getFileData(note, format)

            let file = new File(directory.uri, fileName)
            if (file.exists) file.create({ overwrite: true })

            file = directory.createFile(fileName, EXPORT_MIME_TYPES[format])
            file.write(fileData)

            showSnackbar(t('message.notes.exported'))
        } catch (error) {
            if (error.code === 'ERR_PICKER_CANCELLED') return

            console.log(error)
            showSnackbar(t('message.notes.export_failed'))
        }
    }

    const shareFile = async (id, format = EXPORT_FORMATS.MARKDOWN) => {
        const note = getNote(id)

        try {
            const { fileName, fileData } = await getFileData(note, format)

            let file = new File(Paths.cache, fileName)
            if (file.exists) file.create({ overwrite: true })

            file = Paths.cache.createFile(fileName, EXPORT_MIME_TYPES[format])
            file.write(fileData)

            await Sharing.shareAsync(file.uri, { mimeType: EXPORT_MIME_TYPES[format] })
        } catch (error) {
            console.log(error)
            showSnackbar(t('message.notes.share_failed'))
        }
    }

    return { exportFile, shareFile }
}
