import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MarkdownInput } from './MarkdownInput'
import { useMarkdownShortcuts } from '@/hooks'

export function MarkdownEditor({ value, setValue, action, setAction, isEditing }) {
    const { t } = useTranslation()
    const [selection, setSelection] = useState({ start: 0, end: 0 })

    const {
        onBold,
        onItalic,
        onStrikethrough,
        onCode,
        onFormatH1,
        onQuote,
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
        quote: onQuote
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
            readOnly={!isEditing}
            placeholder={t('placeholder.note')}
            onSelectionChange={onSelectionChange}
        />
    )
}
