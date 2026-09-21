import { useTranslation } from 'react-i18next'

import { LargeInput } from '@/components/input/large-input'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { Section } from '@/components/section'

export const TemplateEditorForm = ({
    name,
    setName,
    content,
    setContent,
    markdownAction,
    mode,
    onFocus,
    onBlur,
    onHistoryChange,
    searchQuery,
    replaceText
}) => {
    const { t } = useTranslation()

    return (
        <>
            <Section containerStyle={{ paddingHorizontal: 16 }}>
                <LargeInput
                    bold
                    value={name}
                    onChangeText={setName}
                    placeholder={t('placeholder.title')}
                />
            </Section>

            <Section
                containerStyle={{ flex: 1 }}
                contentStyle={{ flex: 1 }}
            >
                <MarkdownInput
                    value={content}
                    onChangeText={setContent}
                    action={markdownAction.action}
                    payload={markdownAction.payload}
                    onActionHandled={markdownAction.clear}
                    mode={mode}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onHistoryChange={onHistoryChange}
                    searchQuery={searchQuery}
                    replaceText={replaceText}
                    placeholder={t('placeholder.note')}
                />
            </Section>
        </>
    )
}
