import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
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
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useUtils } from '@/hooks/use-utils'
import { splitTemplatePath, joinTemplatePath } from '@/utils/template-path'
import { stripNoteExtension } from '@/utils/note-filename'
import { useVersionHistory } from '@/hooks/use-version-history'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { TEMPLATES_FOLDER_NAME } from '@/constants/file-storage'
import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'
import { logError } from '@/utils/log-error'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const { getTemplate, getFolderUri, updateTemplate, deleteTemplate } = useTemplates()
    const { pro } = usePro()
    const { pinned, updatePinned } = useUtils()
    const { removeRecent } = useRecentNotes()
    const { activeRepository, getRootRepository } = useRepositories()

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
    const [folderUri, setFolderUri] = useState('')

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
        folderUri && activeRepository
            ? {
                rootUri: getRootRepository(activeRepository).uri,
                folderUri,
                folderPath: joinTemplatePath(
                    TEMPLATES_FOLDER_NAME,
                    splitTemplatePath(filename).dir
                )
            }
            : null
    ), [folderUri, activeRepository, getRootRepository, filename])

    const versionNoteId = splitTemplatePath(currentFilename.current).base

    const latestContent = useRef({ noteId: versionNoteId, title: name, content })
    latestContent.current = { noteId: versionNoteId, title: name, content }

    const versionHistory = useVersionHistory({ location, latestContent })
    const { onClose: closeVersionHistory } = versionHistory

    const onRestoreVersion = useCallback((version) => {
        setName(version.title)
        setContent(version.content)
        closeVersionHistory()
    }, [closeVersionHistory])

    const editorActions = useMemo(() => ({
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch: searchSheet.onOpen
    }), [recentsSheet.onOpen, searchSheet.onOpen])

    const onConfirmDelete = async () => {
        try {
            await deleteTemplate(currentFilename.current)

            const deletedId = TEMPLATE_TAB_PREFIX + currentFilename.current
            removeRecent(deletedId)

            if (pinned.has(deletedId)) {
                const next = new Set(pinned)
                next.delete(deletedId)
                updatePinned(next)
            }

            router.back()
        } catch (error) {
            logError('error deleting template', error)
            showSnackbar(t('templates.delete_failed'))
        }
    }

    const onOpenDeleteDialog = () => setDeleteDialogVisible(true)
    const onCloseDeleteDialog = () => setDeleteDialogVisible(false)

    const onOpenPlaceholders = () => setPlaceholdersVisible(true)

    const loadTemplate = useEffectEvent((isCancelled) => {
        getTemplate(filename).then((template) => {
            if (isCancelled()) return

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
    })

    useEffect(() => {
        let cancelled = false
        loadTemplate(() => cancelled)
        return () => { cancelled = true }
    }, [filename])

    useAutosave(async () => {
        const trimmedName = name.trim()
        if (trimmedName === originalName.current && content === originalContent.current) return

        const nextName = trimmedName === originalName.current
            ? stripNoteExtension(splitTemplatePath(currentFilename.current).base)
            : trimmedName

        currentFilename.current = await updateTemplate(currentFilename.current, nextName, content)
        originalName.current = trimmedName
        originalContent.current = content
    }, [name, content], { skip: loading || !name.trim() })

    useEffect(() => {
        if (!activeRepository) return

        getFolderUri(splitTemplatePath(filename).dir).then((uri) => setFolderUri(uri || ''))
    }, [activeRepository, filename, getFolderUri])

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
                    noteId={versionNoteId}
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
