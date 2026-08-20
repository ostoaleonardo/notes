import { useEffect, useRef, useState } from 'react'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { LargeInput, MarkdownEditor, Section } from '@/components'
import { MarkdownControls } from '@/screens/notes'
import { TemplatePlaceholders } from '@/screens/modals'
import { useMarkdownAction, useTemplates } from '@/hooks'
import { KeyboardStickyView } from 'react-native-keyboard-controller'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const navigation = useNavigation()
    const { getTemplate, updateTemplate, deleteTemplate } = useTemplates()

    const loading = useRef(true)
    const currentFilename = useRef(filename)

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [isEditing, setIsEditing] = useState(true)
    const [placeholdersVisible, setPlaceholdersVisible] = useState(false)

    const markdownAction = useMarkdownAction()
    const onEditMarkdown = () => setIsEditing((prev) => !prev)

    const onRunAction = (action) => {
        if (action === 'table' || action === 'link' || action === 'image') {
            markdownAction.run(action, {})
            return
        }

        markdownAction.run(action)
    }

    const onDelete = async () => {
        await deleteTemplate(currentFilename.current)
        router.back()
    }

    const onOpenPlaceholders = () => setPlaceholdersVisible(true)

    useEffect(() => {
        navigation.setOptions({ onDelete, onOpenPlaceholders })
    }, [])

    useEffect(() => {
        getTemplate(filename).then((template) => {
            if (!template) return

            setName(template.name)
            setContent(template.content)
            setTimeout(() => { loading.current = false }, 0)
        })
    }, [])

    useEffect(() => {
        if (loading.current || !name.trim()) return

        const timer = setTimeout(async () => {
            currentFilename.current = await updateTemplate(currentFilename.current, name.trim(), content)
        }, 500)

        return () => clearTimeout(timer)
    }, [name, content])

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

            <Section containerStyle={{ paddingHorizontal: 16 }}>
                <MarkdownEditor
                    value={content}
                    setValue={setContent}
                    markdownAction={markdownAction}
                    isEditing={isEditing}
                />
            </Section>

            <KeyboardStickyView style={{ position: 'absolute', bottom: 16 }}>
                <MarkdownControls
                    isEditing={isEditing}
                    onRunAction={onRunAction}
                    onEditMarkdown={onEditMarkdown}
                    scope='template'
                />
            </KeyboardStickyView>

            <TemplatePlaceholders
                visible={placeholdersVisible}
                onDismiss={() => setPlaceholdersVisible(false)}
            />
        </>
    )
}
