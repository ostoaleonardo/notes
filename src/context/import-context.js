import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as Linking from 'expo-linking'
import { File } from 'expo-file-system'
import { randomUUID } from 'expo-crypto'
import { useRouter } from 'expo-router'

import { useNotes } from '../hooks/use-notes'
import { usePro } from '../hooks/use-pro'
import { getDate } from '@/utils/date'

import { ROUTES } from '@/constants/routes'

export const ImportContext = createContext()

export function ImportProvider({ children }) {
    const router = useRouter()
    const { pro } = usePro()
    const { saveNote, loading } = useNotes()
    const [importing, setImporting] = useState(false)

    const importFile = useCallback(async (url, name) => {
        try {
            setImporting(true)

            const file = new File(url)
            const note = await file.text()
            const match = (name || file.name).match(/^(.+)\.(md|markdown)$/i)
            const title = match ? match[1] : 'Imported note'
            const id = randomUUID()

            saveNote({
                id,
                title,
                note,
                tags: [],
                images: [],
                createdAt: getDate()
            })

            router.push(ROUTES.HOME)
        } catch (error) {
            console.debug('error importing markdown file', error)
        } finally {
            setImporting(false)
        }
    }, [router, saveNote])

    useEffect(() => {
        const handleUrl = (url) => {
            if (loading || !pro) return
            if (!url) return
            if (!url.startsWith('content://') && !url.startsWith('file://')) return

            importFile(url)
        }

        Linking.getInitialURL().then(handleUrl)
        const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url))

        return () => subscription.remove()
    }, [loading, pro])

    const value = useMemo(() => ({ importing, importFile, pro }), [importing, importFile, pro])

    return (
        <ImportContext.Provider value={value}>
            {children}
        </ImportContext.Provider>
    )
}
