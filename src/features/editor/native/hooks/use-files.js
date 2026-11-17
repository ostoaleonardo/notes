import { useTranslation } from 'react-i18next'
import { Directory, File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Print from 'expo-print'

import { useNotes } from '@/shared/hooks/use-notes'
import { useMediaUris } from './use-media-uris'
import { useDomFonts } from './use-dom-fonts'
import { useHeadingFont } from '@/shared/hooks/use-heading-font'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'
import { buildFileContent } from '@/shared/utils/note-operations'
import { getExportMarkdown, getNoteAsHtml } from '@/features/editor/native/utils/export-html'
import { collectEmbedBodies, extractEmbedImageNames } from '@/features/editor/native/utils/embeds'
import { extractLocalUrls } from '@/features/editor/shared/utils/local-images'
import { resolveUrl } from '@/features/editor/native/utils/resolve-url'
import { pickExportFonts } from '@/features/editor/native/utils/export-fonts'
import { getUniqueFilename } from '@/shared/utils/note-filename'

import {
    EXPORT_FORMATS,
    EXPORT_MIME_TYPES,
    EXPORT_EXTENSIONS,
    EXPORT_LOCAL_IMAGE_URL_PATTERN
} from '@/features/editor/native/constants/export'
import { logError } from '@/shared/utils/log-error'
import { noteBodies } from '@/shared/utils/note-body'

import { PICKER_ERROR_CODES } from '@/shared/constants/picker-errors'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'

export function useFiles() {
    const { t } = useTranslation()
    const { getNote, notes, notePaths } = useNotes()
    const listMediaUris = useMediaUris()
    const { fontKey, fontFamily: headingFont } = useHeadingFont()
    const domFonts = useDomFonts()

    const buildHtml = async (note) => {
        const body = await noteBodies.get(note)
        const bodies = await collectEmbedBodies(body, {
            notes,
            notePaths,
            selfPath: note.path,
            loadBodies: noteBodies.load
        })

        bodies.set(note.path, body)

        const names = extractEmbedImageNames(body)
        const uris = names.length ? await listMediaUris() : new Map()
        const images = new Map()

        await Promise.all(names.map(async (name) => {
            if (uris.has(name)) images.set(name, await resolveUrl(uris.get(name)))
        }))

        const context = {
            notes,
            notePaths,
            bodies,
            getMediaUrl: (name) => images.get(name)
        }
        const localUrls = extractLocalUrls(getExportMarkdown(note, context))
            .filter((url) => EXPORT_LOCAL_IMAGE_URL_PATTERN.test(url))
        const imageUrls = new Map(await Promise.all(
            localUrls.map(async (url) => [url, await resolveUrl(url)])
        ))

        return getNoteAsHtml(note, { ...context, imageUrls, headingFont, fonts: pickExportFonts(domFonts, fontKey) })
    }

    const getFileData = async (note, format) => {
        if (format === EXPORT_FORMATS.PDF) {
            const { uri } = await Print.printToFileAsync({ html: await buildHtml(note) })
            return await new File(uri).bytes()
        }

        if (format === EXPORT_FORMATS.HTML) {
            return buildHtml(note)
        }

        return buildFileContent(note, await noteBodies.get(note))
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
