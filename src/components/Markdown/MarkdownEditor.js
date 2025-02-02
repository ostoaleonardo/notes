import { useTranslation } from 'react-i18next'
import { MarkdownContainer } from './MarkdownContainer'
import { TextArea } from '../Input'
import { useMarkdownShortcuts } from '@/hooks'
import { useEffect, useState } from 'react'

export function MarkdownEditor({ value, setValue, isEditing, isMarkdown, action, setAction }) {
    const { t } = useTranslation()
    const [selection, setSelection] = useState({ start: 0, end: 0 })

    const {
        onBold,
        onItalic,
        onStrikethrough,
        onSelectionChange
    } = useMarkdownShortcuts(
        value, setValue,
        selection, setSelection
    )

    useEffect(() => {
        if (action === '') return

        switch (action) {
            case 'bold':
                onBold()
                break
            case 'italic':
                onItalic()
                break
            case 'strikethrough':
                onStrikethrough()
                break
            default:
                return
        }

        setAction('')
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
