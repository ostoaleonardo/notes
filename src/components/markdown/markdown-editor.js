import { useTranslation } from 'react-i18next'
import { MarkdownInput } from './markdown-input'

export const MarkdownEditor = ({
    value,
    setValue,
    mode,
    markdownAction,
    onFocus,
    onBlur,
    onHistoryChange,
    title,
    setTitle,
    titlePlaceholder,
    dateLabel
}) => {
    const { t } = useTranslation()
    const { action, payload, clear } = markdownAction

    return (
        <MarkdownInput
            value={value}
            onChangeText={setValue}
            onHistoryChange={onHistoryChange}
            mode={mode}
            placeholder={t('placeholder.note')}
            action={action}
            payload={payload}
            onActionHandled={clear}
            onFocus={onFocus}
            onBlur={onBlur}
            title={title}
            setTitle={setTitle}
            titlePlaceholder={titlePlaceholder}
            dateLabel={dateLabel}
        />
    )
}
