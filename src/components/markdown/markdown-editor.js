import { useTranslation } from 'react-i18next'

import { MarkdownInput } from './markdown-input'

export const MarkdownEditor = ({
    id,
    value,
    setValue,
    mode,
    markdownAction,
    onFocus,
    onBlur,
    onHistoryChange,
    title,
    setTitle,
    onTitleBlur,
    titlePlaceholder,
    metaLabel,
    searchQuery,
    replaceText,
    showBacklinks
}) => {
    const { t } = useTranslation()
    const { action, payload, clear } = markdownAction

    return (
        <MarkdownInput
            id={id}
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
            onTitleBlur={onTitleBlur}
            titlePlaceholder={titlePlaceholder}
            metaLabel={metaLabel}
            searchQuery={searchQuery}
            replaceText={replaceText}
            showBacklinks={showBacklinks}
        />
    )
}
