import { useCallback, useRef } from 'react'

import { useNotes } from './use-notes'
import { useFolders } from './use-folders'
import { useTemplates } from './use-templates'
import { useLanguage } from './use-language'
import { useStorage } from './use-storage'
import { useFileStorage } from './use-file-storage'
import { getDate } from '@/shared/utils/date'
import { getDailyNoteTitle, planDailyNote } from '@/shared/utils/daily-note'
import { noteBodies } from '@/shared/utils/note-body'
import { appendSharedContent } from '@/shared/utils/shared-note'
import { renderTemplate } from '@/shared/utils/render-template'
import { scopedStorageKey } from '@/shared/utils/scoped-storage-key'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

export function useDailyNote() {
    const { getTemplate } = useTemplates()
    const { getItem, setItem } = useStorage()
    const { currentLanguage } = useLanguage()
    const { directoryExists } = useFileStorage()
    const { notes, saveNote, updateNote } = useNotes()
    const { activeFolder, getDescendants } = useFolders()
    const busy = useRef(false)

    const open = async ({ append } = {}) => {
        if (busy.current || !activeFolder) return null

        busy.current = true

        try {
            const folderKey = scopedStorageKey(STORAGE_KEYS.DAILY_NOTE_FOLDER, activeFolder.id)
            const templateKey = scopedStorageKey(STORAGE_KEYS.DAILY_NOTE_TEMPLATE, activeFolder.id)
            const [folderId, templateFilename] = await Promise.all([getItem(folderKey), getItem(templateKey)])

            const title = getDailyNoteTitle()
            const plan = planDailyNote({
                title,
                notes,
                folderId,
                activeFolder,
                descendants: getDescendants(activeFolder.id)
            }, directoryExists)

            if (!plan) return null

            if (plan.existing) {
                if (append) {
                    await updateNote({
                        ...plan.existing,
                        note: appendSharedContent(await noteBodies.get(plan.existing), append)
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
                plan.folder.id
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
