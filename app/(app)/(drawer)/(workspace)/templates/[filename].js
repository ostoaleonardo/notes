import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import { MarkdownEditorLayout } from '@/screens/notes/markdown-editor-layout'
import { MarkdownModeToggle } from '@/screens/notes/markdown-mode-toggle'
import { MarkdownSearchBar } from '@/screens/notes/markdown-search-bar'
import { MarkdownInsertSheets } from '@/screens/notes/markdown-insert-sheets'
import { NoteToolbarSheets } from '@/screens/notes/note-toolbar-sheets'
import { VersionHistoryPanel } from '@/screens/notes/version-history-panel'
import { VersionHistoryContent } from '@/screens/notes/version-history-content'
import { TemplateEditorForm } from '@/screens/templates/template-editor-form'
import { TemplatePlaceholders } from '@/screens/dialogs/template-placeholders'
import { LoadingOverlay } from '@/components/layout'
import { AppBar } from '@/components/app-bar/app-bar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAutosave } from '@/hooks/use-autosave'
import { useEditorChrome } from '@/hooks/use-editor-chrome'
import { usePro } from '@/hooks/use-pro'
import { useRegisterCurrent } from '@/hooks/use-current-note'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { stripNoteExtension } from '@/utils/note-filename'
import { useVersionHistory } from '@/hooks/use-version-history'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { TEMPLATES_FOLDER_NAME } from '@/constants/file-storage'
import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const { getTemplate, updateTemplate, deleteTemplate } = useTemplates()
    const { pro } = usePro()
    const { activeRepository, ensureTemplatesFolder, getRootRepository } = useRepositories()

    const tabId = TEMPLATE_TAB_PREFIX + filename
    useRegisterCurrent(tabId)

    const [loading, setLoading] = useState(true)
    const currentFilename = useRef(filename)
    const originalName = useRef('')
    const originalContent = useRef('')

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [mode, setMode] = useState(EDITOR_MODES.LIVE)
    const [placeholdersVisible, setPlaceholdersVisible] = useState(false)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [templatesUri, setTemplatesUri] = useState('')

    const {
        isFocused,
        onFocus,
        onBlur,
        recentsSheet,
        searchSheet,
        action,
        search,
        canUndo,
        canRedo,
        onHistoryChange,
        onRunAction,
        linkSheet,
        tableSheet,
        imageSheet
    } = useEditorChrome()

    const location = useMemo(() => (
        templatesUri && activeRepository
            ? {
                rootUri: getRootRepository(activeRepository).uri,
                folderUri: templatesUri,
                folderPath: TEMPLATES_FOLDER_NAME
            }
            : null
    ), [templatesUri, activeRepository, getRootRepository])

    const latestContent = useRef({ noteId: currentFilename.current, title: name, content })
    latestContent.current = { noteId: currentFilename.current, title: name, content }

    const versionHistory = useVersionHistory({ location, latestContent })

    const onRestoreVersion = useCallback((version) => {
        setName(version.title)
        setContent(version.content)
        versionHistory.onClose()
    }, [versionHistory.onClose])

    const editorActions = useMemo(() => ({
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch: searchSheet.onOpen
    }), [recentsSheet.onOpen, searchSheet.onOpen])

    const onConfirmDelete = async () => {
        try {
            await deleteTemplate(currentFilename.current)
            router.back()
        } catch (error) {
            console.debug('error deleting template', error)
            showSnackbar(t('templates.delete_failed'))
        }
    }

    const onOpenDeleteDialog = () => setDeleteDialogVisible(true)
    const onCloseDeleteDialog = () => setDeleteDialogVisible(false)

    const onOpenPlaceholders = () => setPlaceholdersVisible(true)

    useEffect(() => {
        let cancelled = false

        getTemplate(filename).then((template) => {
            if (cancelled) return

            if (!template) {
                router.replace(ROUTES.HOME)
                return
            }

            const displayName = t(`templates.${template.name}`, template.name)

            setName(displayName)
            setContent(template.content)
            originalName.current = displayName
            originalContent.current = template.content

            setLoading(false)
        })

        return () => { cancelled = true }
    }, [filename])

    useAutosave(async () => {
        const trimmedName = name.trim()
        if (trimmedName === originalName.current && content === originalContent.current) return

        const nextName = trimmedName === originalName.current
            ? stripNoteExtension(currentFilename.current)
            : trimmedName

        currentFilename.current = await updateTemplate(currentFilename.current, nextName, content)
        originalName.current = trimmedName
        originalContent.current = content
    }, [name, content], { skip: loading || !name.trim() })

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
            panelContent={(
                <VersionHistoryContent
                    location={location}
                    noteId={currentFilename.current}
                    currentContentRef={latestContent}
                    pro={pro}
                    onRestore={onRestoreVersion}
                    onClose={versionHistory.onClose}
                />
            )}
        >
            <AppBar
                mode='menu'
                trailing={(
                    <MarkdownModeToggle
                        mode={mode}
                        onSetMode={setMode}
                        scope='template'
                        isFocused={isFocused}
                        search={search}
                        onOpenPlaceholders={onOpenPlaceholders}
                        onOpenVersionHistory={versionHistory.onOpen}
                        onOpenDeleteDialog={onOpenDeleteDialog}
                    />
                )}
            />

            <MarkdownSearchBar
                search={search}
                action={action}
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
                    action={action}
                    mode={mode}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onHistoryChange={onHistoryChange}
                    searchQuery={search.searchQuery}
                    replaceText={search.replaceText}
                />
            </MarkdownEditorLayout>

            <MarkdownInsertSheets
                linkSheet={linkSheet}
                tableSheet={tableSheet}
                imageSheet={imageSheet}
                action={action}
            />

            <TemplatePlaceholders
                visible={placeholdersVisible}
                onDismiss={() => setPlaceholdersVisible(false)}
            />

            <ConfirmDialog
                visible={deleteDialogVisible}
                title={t('templates.delete_title')}
                message={t('templates.delete_message')}
                confirmLabel={t('button.delete')}
                onDismiss={onCloseDeleteDialog}
                onConfirm={onConfirmDelete}
            />

            <NoteToolbarSheets
                recentsSheet={recentsSheet}
                searchSheet={searchSheet}
            />
        </VersionHistoryPanel>
    )
}
