import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MarkdownInput } from './markdown-input'
import { useMarkdownShortcuts } from '@/hooks'

export function MarkdownEditor({ value, setValue, action, setAction, isEditing, linkPayload, tablePayload, imagePayload }) {
    const { t } = useTranslation()
    const [selection, setSelection] = useState({ start: 0, end: 0 })

    const {
        onBold,
        onItalic,
        onStrikethrough,
        onCode,
        onFormatH1,
        onFormatH2,
        onFormatH3,
        onFormatH4,
        onFormatH5,
        onFormatH6,
        onQuote,
        onHorizontalRule,
        onImage,
        onLink,
        onTable,
        onSelectionChange
    } = useMarkdownShortcuts(
        value, setValue,
        selection, setSelection
    )

    const actions = {
        bold: onBold,
        italic: onItalic,
        strike: onStrikethrough,
        code: onCode,
        h1: onFormatH1,
        h2: onFormatH2,
        h3: onFormatH3,
        h4: onFormatH4,
        h5: onFormatH5,
        h6: onFormatH6,
        quote: onQuote,
        hr: onHorizontalRule,
        image: () => onImage(imagePayload),
        link: () => onLink(linkPayload),
        table: () => onTable(tablePayload)
    }

    useEffect(() => {
        if (action) {
            actions[action]()
            setAction(null)
        }
    }, [action])

    return (
        <MarkdownInput
            value={value}
            onChangeText={setValue}
            isEditing={isEditing}
            placeholder={t('placeholder.note')}
            onSelectionChange={onSelectionChange}
        />
    )
}
