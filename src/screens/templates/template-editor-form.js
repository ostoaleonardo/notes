import { useTranslation } from 'react-i18next'
import { LargeInput, MarkdownEditor, Section } from '@/components'

export function TemplateEditorForm({ name, setName, content, setContent, markdownAction, isEditing }) {
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
                containerStyle={{ flex: 1, paddingHorizontal: 16 }}
                contentStyle={{ flex: 1 }}
            >
                <MarkdownEditor
                    value={content}
                    setValue={setContent}
                    markdownAction={markdownAction}
                    isEditing={isEditing}
                />
            </Section>
        </>
    )
}
