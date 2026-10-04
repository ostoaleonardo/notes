import { useCallback, useRef } from 'react'

import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { useTemplates } from './use-templates'
import { useLanguage } from './use-language'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { getDate } from '@/utils/date'
import { getDailyNoteTitle, planDailyNote } from '@/utils/daily-note'
import { renderTemplate } from '@/utils/render-template'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useDailyNote() {
    const { notes, saveNote } = useNotes()
    const { getTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()
    const { activeRepository, getDescendants } = useRepositories()
    const { getItem, setItem } = useStorage()
    const { directoryExists } = useFileStorage()
    const busy = useRef(false)

    const open = async () => {
        if (busy.current || !activeRepository) return null

        busy.current = true

        try {
            const folderKey = `${STORAGE_KEYS.DAILY_NOTE_FOLDER}:${activeRepository.id}`
            const templateKey = `${STORAGE_KEYS.DAILY_NOTE_TEMPLATE}:${activeRepository.id}`
            const [folderId, templateFilename] = await Promise.all([getItem(folderKey), getItem(templateKey)])

            const title = getDailyNoteTitle()
            const plan = planDailyNote({
                title,
                notes,
                folderId,
                activeRepository,
                descendants: getDescendants(activeRepository.id)
            }, directoryExists)

            if (!plan) return null
            if (plan.existing) return plan.existing.path

            const template = templateFilename ? await getTemplate(templateFilename) : null
            if (templateFilename && !template) await setItem(templateKey, '')

            const note = template ? renderTemplate(template.content, { title, language: currentLanguage }) : ''
            const { path } = await saveNote(
                { title, note, tags: [], createdAt: getDate() },
                plan.repository.id
            )

            return path
        } finally {
            busy.current = false
        }
    }

    const latest = useRef(open)
    latest.current = open

    return useCallback(() => latest.current(), [])
}
