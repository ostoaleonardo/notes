import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks'
import { getPreviewNote, renderTemplate } from '@/utils'
import { TEMPLATE_PREVIEW_MAX_CHARS, TEMPLATE_PREVIEW_MAX_LINES } from '@/constants'
import { CardGrid } from './card-grid'

export function TemplatePicker({ title, templates, onSelect }) {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()

    const cards = useMemo(() => templates.map((template) => ({
        id: template.filename,
        title: t(`templates.${template.name}`, template.name),
        preview: getPreviewNote(
            renderTemplate(template.content, { title, language: currentLanguage }),
            TEMPLATE_PREVIEW_MAX_LINES,
            TEMPLATE_PREVIEW_MAX_CHARS
        )
    })), [templates, title, currentLanguage, t])

    const onOpen = (card) => {
        const template = templates.find((entry) => entry.filename === card.id)
        onSelect(renderTemplate(template.content, { title, language: currentLanguage }))
    }

    return (
        <CardGrid
            cards={cards}
            onOpen={onOpen}
        />
    )
}
