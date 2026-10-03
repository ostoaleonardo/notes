import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBottomSheet } from './use-bottom-sheet'
import { useTemplates } from './use-templates'
import { useTemplatesList } from './use-templates-list'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { TEMPLATE_INSERT_SEPARATOR } from '@/constants/template-placeholders'
import { logError } from '@/utils/log-error'

export function useNoteTemplates({ latestContent, setNote }) {
    const { t } = useTranslation()
    const { addTemplate } = useTemplates()
    const { templates, refresh } = useTemplatesList([], { immediate: false })

    const sheet = useBottomSheet()

    const onSelect = useCallback((content) => {
        setNote((prev) => (prev ? prev + TEMPLATE_INSERT_SEPARATOR + content : content))
        sheet.onClose()
    }, [])

    const onSaveAsTemplate = useCallback(async () => {
        const { title, content } = latestContent.current

        try {
            await addTemplate(title.trim() || t('placeholder.title'), content)
            showSnackbar(t('templates.saved'))
        } catch (error) {
            logError('error saving template', error)
            showSnackbar(t('templates.save_failed'))
        }
    }, [addTemplate, t])

    const onOpen = useCallback(() => {
        refresh()
        sheet.onOpen()
    }, [refresh, sheet.onOpen])

    return {
        sheet,
        templates,
        onOpen,
        onSelect,
        onSaveAsTemplate
    }
}
