import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as Linking from 'expo-linking'
import { File } from 'expo-file-system'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useNotes } from '../hooks/use-notes'
import { usePro } from '../hooks/use-pro'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { extractProperties, readFrontmatterTags, parseFrontmatter } from '@/utils/frontmatter'

import { ROUTES } from '@/constants/routes'
import { logError } from '@/utils/log-error'

export const ImportContext = createContext()

export function ImportProvider({ children }) {
    const router = useRouter()
    const { t } = useTranslation()
    const { saveNote, loading } = useNotes()
    const { pro } = usePro()

    const [importing, setImporting] = useState(false)

    const importFile = useCallback(async (url, name) => {
        try {
            setImporting(true)

            const file = new File(url)
            const { frontmatter, body } = parseFrontmatter(await file.text())
            const match = (name || file.name).match(/^(.+)\.(md|markdown)$/i)
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
            logError('error importing markdown file', error)
        } finally {
            setImporting(false)
        }
    }, [router, saveNote, t])

    useEffect(() => {
        const handleUrl = (url) => {
            if (loading) return
            if (!url) return
            if (!url.startsWith('content://') && !url.startsWith('file://')) return

            if (!pro) {
                showSnackbar(t('repositories.pro_required'))
                return
            }

            importFile(url)
        }

        Linking.getInitialURL().then(handleUrl)
        const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url))

        return () => subscription.remove()
    }, [loading, pro, t, importFile])

    const value = useMemo(() => ({ importing, importFile, pro }), [importing, importFile, pro])

    return (
        <ImportContext.Provider value={value}>
            {children}
        </ImportContext.Provider>
    )
}
