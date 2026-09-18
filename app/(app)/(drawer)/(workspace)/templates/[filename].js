import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import { MarkdownEditorLayout } from '@/screens/notes/markdown-editor-layout'
import { MarkdownModeToggle } from '@/screens/notes/markdown-mode-toggle'
import { RecentNotesSheet } from '@/screens/notes/recent-notes-sheet'
import { VersionHistoryPanel } from '@/screens/notes/version-history-panel'
import { VersionHistoryContent } from '@/screens/notes/version-history-content'
import { TemplateEditorForm } from '@/screens/templates/template-editor-form'
import { TemplatePlaceholders } from '@/screens/modals/template-placeholders'
import { LoadingOverlay } from '@/components/layout'
import { AppBar } from '@/components/app-bar/app-bar'

import { useAllowLandscape } from '@/hooks/use-allow-landscape'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useMarkdownAction } from '@/hooks/use-markdown-action'
import { useNoteVersions } from '@/hooks/use-note-versions'
import { usePro } from '@/hooks/use-pro'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'

import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const { getTemplate, updateTemplate, deleteTemplate } = useTemplates()
    const { pro } = usePro()
    const { activeRepository, ensureTemplatesFolder } = useRepositories()
    const { commitVersion } = useNoteVersions()

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
    const [templatesUri, setTemplatesUri] = useState('')

    const recentsSheet = useBottomSheet()
    const markdownAction = useMarkdownAction()

    const latestContent = useRef({ name, content })
    latestContent.current = { name, content }

    const onHistoryChange = useCallback(({ canUndo, canRedo }) => {
        setCanUndo(canUndo)
        setCanRedo(canRedo)
    }, [])

    const onOpenVersionHistory = useCallback(() => {
        setVersionHistoryVisible(true)
    }, [])

    const onCloseVersionHistory = useCallback(() => setVersionHistoryVisible(false), [])

    const onRestoreVersion = useCallback((version) => {
        setName(version.title)
        setContent(version.content)
        setVersionHistoryVisible(false)
    }, [])

    const versionHistoryPanelContent = useMemo(() => (
        <VersionHistoryContent
            directoryUri={templatesUri}
            noteId={currentFilename.current}
            currentContent={content}
            pro={pro}
            onRestore={onRestoreVersion}
            onClose={onCloseVersionHistory}
        />
    ), [templatesUri, content, pro, onRestoreVersion, onCloseVersionHistory, currentFilename.current])

    const editorActions = useMemo(() => ({
        onOpenRecents: recentsSheet.onOpen
    }), [recentsSheet.onOpen])

    const onRunAction = useCallback((action) => {
        if (action === 'table' || action === 'link' || action === 'image') {
            markdownAction.run(action, {})
            return
        }

        markdownAction.run(action)
    }, [])

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

    useEffect(() => {
        if (!activeRepository) return

        ensureTemplatesFolder(activeRepository).then(setTemplatesUri)
    }, [activeRepository])

    useEffect(() => {
        if (!templatesUri) return

        return () => {
            const { name, content } = latestContent.current
            commitVersion(templatesUri, currentFilename.current, name, content)
        }
    }, [templatesUri])

    if (loading) return <LoadingOverlay />

    return (
        <VersionHistoryPanel
            visible={versionHistoryVisible}
            onOpen={onOpenVersionHistory}
            onClose={onCloseVersionHistory}
            swipeEnabled={pro}
            panelContent={versionHistoryPanelContent}
        >
            <AppBar
                mode='menu'
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

            <RecentNotesSheet sheet={recentsSheet} />
        </VersionHistoryPanel>
    )
}
