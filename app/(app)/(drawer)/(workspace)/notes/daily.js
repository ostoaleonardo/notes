import { useEffect, useRef } from 'react'
import { router } from 'expo-router'

import { useDailyNote } from '@/hooks/use-daily-note'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { getEditorPath } from '@/utils/editor-path'

export default function DailyNote() {
    const { loading } = useNotes()
    const { activeRepository } = useRepositories()
    const openDailyNote = useDailyNote()
    const handled = useRef(false)

    useEffect(() => {
        if (handled.current || loading || !activeRepository) return

        handled.current = true

        openDailyNote().then((path) => {
            if (path) router.replace(getEditorPath(path))
        })
    }, [loading, activeRepository, openDailyNote])

    return null
}
