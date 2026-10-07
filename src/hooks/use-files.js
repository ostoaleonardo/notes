import { useTranslation } from 'react-i18next'
import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Print from 'expo-print'

import { useNotes } from './use-notes'
import { useImageUris } from './use-image-uris'
import { resolveUrl } from './use-resolved-preview-markdown'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { buildFileContent } from '@/utils/note-operations'
import { getExportMarkdown, getNoteAsHtml } from '@/utils/export-html'
import { extractEmbedImageNames } from '@/utils/embeds'
import { extractLocalUrls } from '@/utils/local-images'
import { getUniqueFilename } from '@/utils/note-filename'

import {
    EXPORT_FORMATS,
    EXPORT_MIME_TYPES,
    EXPORT_EXTENSIONS,
    EXPORT_LOCAL_IMAGE_URL_PATTERN
} from '@/constants/export'
import { logError } from '@/utils/log-error'

import { PICKER_ERROR_CODES } from '@/constants/picker-errors'
import { LOG_MESSAGES } from '@/constants/log-messages'

export function useFiles() {
    const { t } = useTranslation()
    const { getNote, notes, notePaths } = useNotes()
    const listImageUris = useImageUris()

    const buildHtml = async (note) => {
        const names = extractEmbedImageNames(note.note || '')
        const uris = names.length ? listImageUris() : new Map()
        const images = new Map()

        await Promise.all(names.map(async (name) => {
            if (uris.has(name)) images.set(name, await resolveUrl(uris.get(name)))
        }))

        const context = {
            notes,
            notePaths,
            getImageUrl: (name) => images.get(name)
        }
        const localUrls = extractLocalUrls(getExportMarkdown(note, context))
            .filter((url) => EXPORT_LOCAL_IMAGE_URL_PATTERN.test(url))
        const imageUrls = new Map(await Promise.all(
            localUrls.map(async (url) => [url, await resolveUrl(url)])
        ))

        return getNoteAsHtml(note, { ...context, imageUrls })
    }

    const getFileData = async (note, format) => {
        if (format === EXPORT_FORMATS.PDF) {
            const { uri } = await Print.printToFileAsync({ html: await buildHtml(note) })
            return await new File(uri).bytes()
        }

        if (format === EXPORT_FORMATS.HTML) {
            return buildHtml(note)
        }

        return buildFileContent(note)
    }

    const resolveExportFilename = (directory, note, format) => {
        const existingNames = directory.list()
            .filter((entry) => entry instanceof File)
            .map((entry) => entry.name)

        return getUniqueFilename(existingNames, note.title, null, `.${EXPORT_EXTENSIONS[format]}`)
    }

    const exportFile = async (id, format = EXPORT_FORMATS.MARKDOWN) => {
        const note = getNote(id)

        try {
            const directory = await Directory.pickDirectoryAsync()
            const fileData = await getFileData(note, format)
            const fileName = resolveExportFilename(directory, note, format)

            const file = directory.createFile(fileName, EXPORT_MIME_TYPES[format])
            file.write(fileData)

            showSnackbar(t('message.notes.exported'))
        } catch (error) {
            if (error.code === PICKER_ERROR_CODES.CANCELLED) return

            logError(LOG_MESSAGES.ERROR_SHARING_NOTE, error)
            showSnackbar(t('message.notes.export_failed'))
        }
    }

    const shareFile = async (id, format = EXPORT_FORMATS.MARKDOWN) => {
        const note = getNote(id)

        try {
            const fileData = await getFileData(note, format)
            const fileName = resolveExportFilename(Paths.cache, note, format)

            const file = Paths.cache.createFile(fileName, EXPORT_MIME_TYPES[format])
            file.write(fileData)

            await Sharing.shareAsync(file.uri, { mimeType: EXPORT_MIME_TYPES[format] })
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_SHARING_NOTE, error)
            showSnackbar(t('message.notes.share_failed'))
        }
    }

    return { exportFile, shareFile }
}
