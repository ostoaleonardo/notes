import { randomUUID } from 'expo-crypto'
import { useEffect, useRef, useState } from 'react'
import { router } from 'expo-router'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useLanguage } from '@/hooks/use-language'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { getDate } from '@/utils/date'
import { getDailyNoteTitle } from '@/utils/daily-note'
import { getEditorPath } from '@/utils/editor-path'
import { renderTemplate } from '@/utils/render-template'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export default function DailyNote() {
    const { notes, saveNote } = useNotes()
    const { getTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()
    const { activeRepository, repositories } = useRepositories()

    const [folderId, setFolderId] = useState(null)
    const [templateFilename, setTemplateFilename] = useState(null)
    const handled = useRef(false)

    const folderStorageKey = activeRepository ? `${STORAGE_KEYS.DAILY_NOTE_FOLDER}:${activeRepository.id}` : null
    useStorageEffect(folderStorageKey, (value) => setFolderId(value || ''))

    const templateStorageKey = activeRepository ? `${STORAGE_KEYS.DAILY_NOTE_TEMPLATE}:${activeRepository.id}` : null
    useStorageEffect(templateStorageKey, (value) => setTemplateFilename(value || ''))

    useEffect(() => {
        if (handled.current || !activeRepository || folderId === null || templateFilename === null) return

        const targetRepository = repositories.find((repository) => repository.id === folderId) || activeRepository

        handled.current = true

        const title = getDailyNoteTitle()
        const existing = notes.find((note) => note.title === title)

        if (existing) {
            router.replace(getEditorPath(existing.id))
            return
        }

        const createNote = async () => {
            const template = templateFilename ? await getTemplate(templateFilename) : null
            const note = template ? renderTemplate(template.content, { title, language: currentLanguage }) : ''

            const id = randomUUID()
            saveNote({ id, title, note, tags: [], createdAt: getDate() }, targetRepository.id)
            router.replace(getEditorPath(id))
        }

        createNote()
    }, [activeRepository, repositories, notes, folderId, templateFilename, getTemplate, currentLanguage, saveNote])

    return null
}
