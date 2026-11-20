import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as Linking from 'expo-linking'
import { File } from 'expo-file-system'
import { useTranslation } from 'react-i18next'

import { useNotes } from '@/shared/hooks/use-notes'
import { decomposeNoteFile } from '@/shared/utils/note-file-content'

import { ROUTES } from '@/shared/constants/routes'
import { MARKDOWN_FILE_NAME_PATTERN } from '@/shared/constants/markdown-patterns'
import { FILE_URI_SCHEMES } from '@/shared/constants/file-uri-schemes'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'
import { pushOnce } from '@/shared/utils/navigation'

export const ImportContext = createContext()

export const ImportProvider = ({ children }) => {
    const { t } = useTranslation()
    const { saveNote, loading } = useNotes()

    const [importing, setImporting] = useState(false)

    const importFile = useCallback(async (url, name, folderId) => {
        try {
            setImporting(true)

            const file = new File(url)
            const { body, tags, properties } = decomposeNoteFile(await file.text())
            const match = (name || file.name).match(MARKDOWN_FILE_NAME_PATTERN)
            const title = match ? match[1] : t('notes.untitled')

            await saveNote({
                title,
                note: body,
                tags: tags ?? [],
                properties: properties ?? {}
            }, folderId)

            pushOnce(ROUTES.HOME)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_IMPORTING_MARKDOWN_FILE, error)
        } finally {
            setImporting(false)
        }
    }, [saveNote, t])

    useEffect(() => {
        const handleUrl = (url) => {
            if (loading) return
            if (!url) return
            if (!url.startsWith(FILE_URI_SCHEMES.CONTENT) && !url.startsWith(FILE_URI_SCHEMES.FILE)) return

            importFile(url)
        }

        Linking.getInitialURL().then(handleUrl)
        const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url))

        return () => subscription.remove()
    }, [loading, importFile])

    const value = useMemo(() => ({ importing, importFile }), [importing, importFile])

    return (
        <ImportContext.Provider value={value}>
            {children}
        </ImportContext.Provider>
    )
}
