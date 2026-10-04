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
    const { onOpen: openSheet, onClose: closeSheet } = sheet

    const onSelect = useCallback((content) => {
        setNote((prev) => (prev ? prev + TEMPLATE_INSERT_SEPARATOR + content : content))
        closeSheet()
    }, [setNote, closeSheet])

    const onSaveAsTemplate = useCallback(async () => {
        const { title, content } = latestContent.current

        try {
            await addTemplate(title.trim() || t('placeholder.title'), content)
            showSnackbar(t('templates.saved'))
        } catch (error) {
            logError('error saving template', error)
            showSnackbar(t('templates.save_failed'))
        }
    }, [addTemplate, latestContent, t])

    const onOpen = useCallback(() => {
        refresh()
        openSheet()
    }, [refresh, openSheet])

    return {
        sheet,
        templates,
        onOpen,
        onSelect,
        onSaveAsTemplate
    }
}
