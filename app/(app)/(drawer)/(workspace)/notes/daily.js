import { useEffect, useRef } from 'react'
import { router } from 'expo-router'

import { useDailyNote } from '@/shared/hooks/use-daily-note'
import { useNotes } from '@/shared/hooks/use-notes'
import { useFolders } from '@/shared/hooks/use-folders'
import { getEditorPath } from '@/shared/utils/editor-path'

export default function DailyNote() {
    const { loading } = useNotes()
    const { activeFolder } = useFolders()
    const openDailyNote = useDailyNote()
    const handled = useRef(false)

    useEffect(() => {
        if (handled.current || loading || !activeFolder) return

        handled.current = true

        openDailyNote().then((path) => {
            if (path) router.replace(getEditorPath(path))
        })
    }, [loading, activeFolder, openDailyNote])

    return null
}
