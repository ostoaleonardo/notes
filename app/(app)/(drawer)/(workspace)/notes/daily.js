import { randomUUID } from 'expo-crypto'
import { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useStorage } from '@/hooks/use-storage'
import { getDate } from '@/utils/date'
import { getDailyNoteTitle } from '@/utils/daily-note'
import { getEditorPath } from '@/utils/editor-path'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export default function DailyNote() {
    const { notes, saveNote } = useNotes()
    const { activeRepository, repositories } = useRepositories()
    const { getItem } = useStorage()

    const [folderId, setFolderId] = useState(null)
    const handled = useRef(false)

    useEffect(() => {
        if (!activeRepository) return

        let cancelled = false

        getItem(`${STORAGE_KEYS.DAILY_NOTE_FOLDER}:${activeRepository.id}`).then((value) => {
            if (!cancelled) setFolderId(value || '')
        })

        return () => { cancelled = true }
    }, [activeRepository])

    useEffect(() => {
        if (handled.current || !activeRepository || folderId === null) return

        const targetRepository = repositories.find((repository) => repository.id === folderId) || activeRepository

        handled.current = true

        const title = getDailyNoteTitle()
        const existing = notes.find((note) => note.title === title)

        if (existing) {
            router.replace(getEditorPath(existing.id))
            return
        }

        const id = randomUUID()
        saveNote({ id, title, note: '', tags: [], createdAt: getDate() }, targetRepository.id)
        router.replace(getEditorPath(id))
    }, [activeRepository, repositories, notes, folderId])

    return null
}
