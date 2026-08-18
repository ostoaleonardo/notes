import { createContext, useEffect, useState } from 'react'
import * as Linking from 'expo-linking'
import { File } from 'expo-file-system'
import { randomUUID } from 'expo-crypto'
import { useRouter } from 'expo-router'
import { useNotes } from '../hooks/use-notes'
import { usePremium } from '../hooks/use-premium'
import { getDate } from '@/utils'
import { DEFAULT_NOTE_CATEGORIES, ROUTES } from '@/constants'

export const ImportContext = createContext()

export function ImportProvider({ children }) {
    const router = useRouter()
    const { premium } = usePremium()
    const { saveNote, loading } = useNotes()
    const [importing, setImporting] = useState(false)

    const importFile = async (url, name) => {
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
                categories: DEFAULT_NOTE_CATEGORIES,
                images: [],
                password: '',
                biometrics: false,
                createdAt: getDate()
            })

            router.push(ROUTES.HOME)
        } catch (error) {
            console.debug('error importing markdown file', error)
        } finally {
            setImporting(false)
        }
    }

    useEffect(() => {
        const handleUrl = (url) => {
            if (loading || !premium) return
            if (!url) return
            if (!url.startsWith('content://') && !url.startsWith('file://')) return

            importFile(url)
        }

        Linking.getInitialURL().then(handleUrl)
        const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url))

        return () => subscription.remove()
    }, [loading, premium])

    return (
        <ImportContext.Provider value={{ importing, importFile, premium }}>
            {children}
        </ImportContext.Provider>
    )
}
