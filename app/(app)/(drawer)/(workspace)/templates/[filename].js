import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { LoadingOverlay } from '@/components/layout'
import { TemplateAction } from '@/screens/app-bar-actions'
import { MarkdownControls } from '@/screens/notes'
import { TemplateEditorForm } from '@/screens/templates'
import { TemplatePlaceholders } from '@/screens/modals'
import { useCloseTabOnRemove, useMarkdownAction, useTabBarActions, useTabs, useTemplates } from '@/hooks'
import { TEMPLATE_TAB_PREFIX } from '@/constants'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const navigation = useNavigation()
    const { getTemplate, updateTemplate, deleteTemplate } = useTemplates()
    const { registerTab, setTemplateTitle } = useTabs()

    const tabId = TEMPLATE_TAB_PREFIX + filename

    useCloseTabOnRemove(navigation, tabId)

    const [loading, setLoading] = useState(true)
    const currentFilename = useRef(filename)
    const originalName = useRef('')

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
        getTemplate(filename).then((template) => {
            if (!template) return

            const displayName = t(`templates.${template.name}`, template.name)

            setName(displayName)
            setContent(template.content)
            originalName.current = displayName

            setTimeout(() => {
                setLoading(false)
            }, 0)
        })

        registerTab(tabId)
    }, [filename])

    useEffect(() => {
        if (name) setTemplateTitle(tabId, name)
    }, [name])

    useEffect(() => {
        if (loading || !name.trim()) return

        const timer = setTimeout(async () => {
            const trimmedName = name.trim()
            const nextName = trimmedName === originalName.current
                ? currentFilename.current.replace(/\.md$/i, '')
                : trimmedName

            currentFilename.current = await updateTemplate(currentFilename.current, nextName, content)
        }, 500)

        return () => clearTimeout(timer)
    }, [name, content, loading])

    useTabBarActions({
        onOpenDrawer: () => navigation.dispatch({ type: 'OPEN_DRAWER' }),
        menu: (
            <TemplateAction
                onOpenPlaceholders={onOpenPlaceholders}
                onDelete={onDelete}
            />
        )
    }, [])

    if (loading) return <LoadingOverlay />

    return (
        <>
            <View style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior='height'
                    style={{ flex: 1 }}
                >
                    <TemplateEditorForm
                        name={name}
                        setName={setName}
                        content={content}
                        setContent={setContent}
                        markdownAction={markdownAction}
                        isEditing={isEditing}
                    />
                </KeyboardAvoidingView>

                <MarkdownControls
                    isEditing={isEditing}
                    onRunAction={onRunAction}
                    onEditMarkdown={onEditMarkdown}
                    scope='template'
                />
            </View>

            <TemplatePlaceholders
                visible={placeholdersVisible}
                onDismiss={() => setPlaceholdersVisible(false)}
            />
        </>
    )
}
