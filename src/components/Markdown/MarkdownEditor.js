import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MarkdownContainer } from './MarkdownContainer'
import { TextArea } from '../Input'
import { useMarkdownShortcuts } from '@/hooks'

export function MarkdownEditor({ value, setValue, isEditing, isMarkdown, action, setAction }) {
    const { t } = useTranslation()
    const [selection, setSelection] = useState({ start: 0, end: 0 })

    const {
        onBold,
        onItalic,
        onStrikethrough,
        onFormatH1,
        onFormatH2,
        onFormatH3,
        onFormatH4,
        onSelectionChange
    } = useMarkdownShortcuts(
        value, setValue,
        selection, setSelection
    )

    const actions = {
        bold: onBold,
        italic: onItalic,
        strike: onStrikethrough,
        h1: onFormatH1,
        h2: onFormatH2,
        h3: onFormatH3,
        h4: onFormatH4
    }

    useEffect(() => {
        if (action) {
            actions[action]()
            setAction(null)
        }
    }, [action])

    return (
        !isMarkdown || isEditing ? (
            <TextArea
                value={value}
                onChangeText={setValue}
                onSelectionChange={onSelectionChange}
                placeholder={t('placeholder.note')}
            />
        ) : (
            <MarkdownContainer>
                {value}
            </MarkdownContainer>
        )
    )
}
