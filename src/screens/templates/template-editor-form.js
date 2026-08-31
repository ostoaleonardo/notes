import { useTranslation } from 'react-i18next'
import { LargeInput, MarkdownEditor, Section } from '@/components'

export const TemplateEditorForm = ({ name, setName, content, setContent, markdownAction, mode, onFocus, onBlur, onHistoryChange }) => {
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
                <MarkdownEditor
                    value={content}
                    setValue={setContent}
                    markdownAction={markdownAction}
                    mode={mode}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onHistoryChange={onHistoryChange}
                />
            </Section>
        </>
    )
}
