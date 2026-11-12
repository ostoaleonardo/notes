import { useCallback, useRef } from 'react'

import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { useTemplates } from './use-templates'
import { useLanguage } from './use-language'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { getDate } from '@/utils/date'
import { getDailyNoteTitle, planDailyNote } from '@/utils/daily-note'
import { appendSharedContent } from '@/utils/shared-note'
import { renderTemplate } from '@/utils/render-template'
import { scopedStorageKey } from '@/utils/scoped-storage-key'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useDailyNote() {
    const { getTemplate } = useTemplates()
    const { getItem, setItem } = useStorage()
    const { currentLanguage } = useLanguage()
    const { directoryExists } = useFileStorage()
    const { notes, saveNote, updateNote } = useNotes()
    const { activeRepository, getDescendants } = useRepositories()
    const busy = useRef(false)

    const open = async ({ append } = {}) => {
        if (busy.current || !activeRepository) return null

        busy.current = true

        try {
            const folderKey = scopedStorageKey(STORAGE_KEYS.DAILY_NOTE_FOLDER, activeRepository.id)
            const templateKey = scopedStorageKey(STORAGE_KEYS.DAILY_NOTE_TEMPLATE, activeRepository.id)
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

            if (plan.existing) {
                if (append) {
                    await updateNote({
                        ...plan.existing,
                        note: appendSharedContent(plan.existing.note, append)
                    })
                }

                return plan.existing.path
            }

            const template = templateFilename ? await getTemplate(templateFilename) : null
            if (templateFilename && !template) await setItem(templateKey, '')

            const rendered = template ? renderTemplate(template.content, { title, language: currentLanguage }) : ''
            const note = append ? appendSharedContent(rendered, append) : rendered

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

    return useCallback((options) => latest.current(options), [])
}
