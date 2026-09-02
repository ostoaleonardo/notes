import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LoadingOverlay } from '@/components/layout'
import { AppBar, ModalSheet, Typography } from '@/components'
import { MarkdownEditorLayout, MarkdownModeToggle, RecentNotes, VersionHistoryPanel } from '@/screens/notes'
import { TemplateEditorForm } from '@/screens/templates'
import { TemplatePlaceholders } from '@/screens/modals'
import { useAllowLandscape, useBottomSheet, useMarkdownAction, usePremium, useRegisterCurrent, useTemplates } from '@/hooks'
import { TEMPLATE_TAB_PREFIX } from '@/constants'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const { getTemplate, updateTemplate, deleteTemplate } = useTemplates()
    const { premium } = usePremium()

    useAllowLandscape()

    const tabId = TEMPLATE_TAB_PREFIX + filename
    useRegisterCurrent(tabId)

    const [loading, setLoading] = useState(true)
    const currentFilename = useRef(filename)
    const originalName = useRef('')

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [mode, setMode] = useState('live')
    const [isFocused, setIsFocused] = useState(false)
    const [placeholdersVisible, setPlaceholdersVisible] = useState(false)
    const [versionHistoryVisible, setVersionHistoryVisible] = useState(false)
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    const recentsSheet = useBottomSheet()
    const markdownAction = useMarkdownAction()

    const onHistoryChange = useCallback(({ canUndo, canRedo }) => {
        setCanUndo(canUndo)
        setCanRedo(canRedo)
    }, [])

    const onOpenVersionHistory = useCallback(() => {
        if (!premium) {
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return
        }

        setVersionHistoryVisible(true)
    }, [premium, t])

    const onCloseVersionHistory = useCallback(() => setVersionHistoryVisible(false), [])

    const versionHistoryPanelContent = useMemo(() => (
        <Typography opacity={0.5}>
            {t('message.version_history.empty')}
        </Typography>
    ), [t])

    const editorActions = useMemo(() => ({
        onOpenRecents: recentsSheet.onOpen
    }), [recentsSheet.onOpen])

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
    }, [filename])

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

    if (loading) return <LoadingOverlay />

    return (
        <VersionHistoryPanel
            visible={versionHistoryVisible}
            onOpen={onOpenVersionHistory}
            onClose={onCloseVersionHistory}
            swipeEnabled={premium}
            panelContent={versionHistoryPanelContent}
        >
            <AppBar
                trailing={(
                    <MarkdownModeToggle
                        mode={mode}
                        onSetMode={setMode}
                        scope='template'
                        onOpenPlaceholders={onOpenPlaceholders}
                        onOpenVersionHistory={onOpenVersionHistory}
                        onDelete={onDelete}
                    />
                )}
            />

            <MarkdownEditorLayout
                mode={mode}
                isFocused={isFocused}
                onRunAction={onRunAction}
                scope='template'
                actions={editorActions}
                canUndo={canUndo}
                canRedo={canRedo}
            >
                <TemplateEditorForm
                    name={name}
                    setName={setName}
                    content={content}
                    setContent={setContent}
                    markdownAction={markdownAction}
                    mode={mode}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onHistoryChange={onHistoryChange}
                />
            </MarkdownEditorLayout>

            <TemplatePlaceholders
                visible={placeholdersVisible}
                onDismiss={() => setPlaceholdersVisible(false)}
            />

            <ModalSheet
                ref={recentsSheet.ref}
                onClose={recentsSheet.onClose}
                title={t('search.recent')}
            >
                <RecentNotes onClose={recentsSheet.onClose} />
            </ModalSheet>
        </VersionHistoryPanel>
    )
}
