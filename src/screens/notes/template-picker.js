import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CardGrid } from './card-grid'

import { useLanguage } from '@/hooks/use-language'
import { getPreviewNote } from '@/utils/preview-note'
import { renderTemplate } from '@/utils/render-template'

export function TemplatePicker({ title, templates, onSelect }) {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()

    const cards = useMemo(() => templates.map((template) => ({
        id: template.filename,
        title: t(`templates.${template.name}`, template.name),
        preview: getPreviewNote(renderTemplate(template.content, { title, language: currentLanguage }))
    })), [templates, title, currentLanguage, t])

    const onOpen = useCallback((card) => {
        const template = templates.find((entry) => entry.filename === card.id)
        onSelect(renderTemplate(template.content, { title, language: currentLanguage }))
    }, [templates, title, currentLanguage, onSelect])

    return (
        <CardGrid
            cards={cards}
            onOpen={onOpen}
            previewLines={14}
        />
    )
}
