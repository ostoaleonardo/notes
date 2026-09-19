import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import { MarkdownEditorLayout } from '@/screens/notes/markdown-editor-layout'
import { MarkdownModeToggle } from '@/screens/notes/markdown-mode-toggle'
import { MarkdownSearchBar } from '@/screens/notes/markdown-search-bar'
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
import { useMarkdownSearch } from '@/hooks/use-markdown-search'
import { usePro } from '@/hooks/use-pro'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useVersionHistory } from '@/hooks/use-version-history'

import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const { getTemplate, updateTemplate, deleteTemplate } = useTemplates()
    const { pro } = usePro()
    const { activeRepository, ensureTemplatesFolder } = useRepositories()

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
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)
    const [templatesUri, setTemplatesUri] = useState('')

    const recentsSheet = useBottomSheet()
    const markdownAction = useMarkdownAction()
    const search = useMarkdownSearch()

    const latestContent = useRef({ noteId: currentFilename.current, title: name, content })
    latestContent.current = { noteId: currentFilename.current, title: name, content }

    const versionHistory = useVersionHistory({ directoryUri: templatesUri, latestContent })

    const onHistoryChange = useCallback(({ canUndo, canRedo }) => {
        setCanUndo(canUndo)
        setCanRedo(canRedo)
    }, [])

    const onRestoreVersion = useCallback((version) => {
        setName(version.title)
        setContent(version.content)
        versionHistory.onClose()
    }, [versionHistory.onClose])

    const versionHistoryPanelContent = useMemo(() => (
        <VersionHistoryContent
            directoryUri={templatesUri}
            noteId={currentFilename.current}
            currentContent={content}
            pro={pro}
            onRestore={onRestoreVersion}
            onClose={versionHistory.onClose}
        />
    ), [templatesUri, content, pro, onRestoreVersion, versionHistory.onClose, currentFilename.current])

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

    if (loading) return <LoadingOverlay />

    return (
        <VersionHistoryPanel
            visible={versionHistory.visible}
            onOpen={versionHistory.onOpen}
            onClose={versionHistory.onClose}
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
                        isFocused={isFocused}
                        onOpenSearch={search.onOpenSearch}
                        onOpenReplace={search.onOpenReplace}
                        onOpenPlaceholders={onOpenPlaceholders}
                        onOpenVersionHistory={versionHistory.onOpen}
                        onDelete={onDelete}
                    />
                )}
            />

            <MarkdownSearchBar
                visible={search.visible}
                replaceVisible={search.replaceVisible}
                query={search.query}
                onQueryChange={search.setQuery}
                replacement={search.replacement}
                onReplacementChange={search.setReplacement}
                onPrevious={() => markdownAction.run('search-previous')}
                onNext={() => markdownAction.run('search-next')}
                onReplaceOne={() => markdownAction.run('search-replace')}
                onReplaceAll={() => markdownAction.run('search-replace-all')}
                onClose={search.onClose}
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
                    searchQuery={search.visible ? search.query : ''}
                    replaceText={search.replacement}
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
