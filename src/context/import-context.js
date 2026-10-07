import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as Linking from 'expo-linking'
import { File } from 'expo-file-system'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useNotes } from '@/hooks/use-notes'
import { extractProperties, readFrontmatterTags, parseFrontmatter } from '@/utils/frontmatter'

import { ROUTES } from '@/constants/routes'
import { MARKDOWN_FILE_NAME_PATTERN } from '@/constants/markdown-patterns'
import { FILE_URI_SCHEMES } from '@/constants/file-uri-schemes'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

export const ImportContext = createContext()

export function ImportProvider({ children }) {
    const router = useRouter()
    const { t } = useTranslation()
    const { saveNote, loading } = useNotes()

    const [importing, setImporting] = useState(false)

    const importFile = useCallback(async (url, name) => {
        try {
            setImporting(true)

            const file = new File(url)
            const { frontmatter, body } = parseFrontmatter(await file.text())
            const match = (name || file.name).match(MARKDOWN_FILE_NAME_PATTERN)
            const title = match ? match[1] : t('notes.untitled')
            const tags = readFrontmatterTags(frontmatter)

            await saveNote({
                title,
                note: body,
                tags,
                properties: extractProperties(frontmatter)
            })

            router.push(ROUTES.HOME)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_IMPORTING_MARKDOWN_FILE, error)
        } finally {
            setImporting(false)
        }
    }, [router, saveNote, t])

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
