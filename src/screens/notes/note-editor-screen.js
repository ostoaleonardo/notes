import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router'

import { MarkdownEditorLayout } from './markdown-editor-layout'
import { MarkdownModeToggle } from './markdown-mode-toggle'
import { MarkdownSearchBar } from './markdown-search-bar'
import { MarkdownInsertSheets } from './markdown-insert-sheets'
import { TemplatePickerSheet } from './template-picker-sheet'
import { RecentNotesSheet } from './recent-notes-sheet'
import { NoteSearchSheet } from './note-search-sheet'
import { VersionHistoryPanel } from './version-history-panel'
import { VersionHistoryContent } from './version-history-content'
import { Tags } from '@/screens/modals/tags'
import { ExportFormat } from '@/screens/modals/export-format'
import { AppBar } from '@/components/app-bar/app-bar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { ModalSheet } from '@/components/modal/modal-sheet'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAllowLandscape } from '@/hooks/use-allow-landscape'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useFiles } from '@/hooks/use-files'
import { useLanguage } from '@/hooks/use-language'
import { useMarkdownAction } from '@/hooks/use-markdown-action'
import { useMarkdownInsertSheets } from '@/hooks/use-markdown-insert-sheets'
import { useMarkdownSearch } from '@/hooks/use-markdown-search'
import { useNotes } from '@/hooks/use-notes'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useUndoRedoState } from '@/hooks/use-undo-redo-state'
import { useVersionHistory } from '@/hooks/use-version-history'
import { getFormattedDate } from '@/utils/formatted-date'
import { countWords } from '@/utils/word-count'

export const NoteEditorScreen = ({
    id,
    repositoryId,
    title, setTitle,
    onTitleBlur,
    note, setNote,
    tags, setTags,
    createdAt, updatedAt,
    initialMode = 'read',
    flush
}) => {
    const { t } = useTranslation()
    const { addTemplate, listTemplates } = useTemplates()
    const { exportFile, shareFile } = useFiles()
    const { currentLanguage } = useLanguage()
    const { deleteNote, setParamId } = useNotes()
    const { pro } = usePro()
    const { repositories } = useRepositories()

    const directoryUri = repositories.find((repository) => repository.id === repositoryId)?.uri

    useAllowLandscape()

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)
    const [showBacklinks, setShowBacklinks] = useState(true)
    const [exportDialogVisible, setExportDialogVisible] = useState(false)
    const [shareDialogVisible, setShareDialogVisible] = useState(false)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [templates, setTemplates] = useState([])
    const { canUndo, canRedo, onHistoryChange } = useUndoRedoState()

    const metaLabel = useMemo(() => (
        mode === 'read'
            ? ((createdAt || updatedAt)
                ? `${updatedAt ? t('date.updated') : t('date.created')} ${getFormattedDate(updatedAt || createdAt, currentLanguage)}`
                : '')
            : (() => {
                const { words, characters } = countWords(note)
                return words > 0 ? `${t('count.words', { count: words })} · ${t('count.characters', { count: characters })}` : ''
            })()
    ), [
        t,
        mode,
        note,
        createdAt,
        updatedAt,
        currentLanguage
    ])

    const markdownAction = useMarkdownAction()
    const search = useMarkdownSearch()

    const latestContent = useRef({ noteId: id, title, content: note })
    latestContent.current = { noteId: id, title, content: note }

    const versionHistory = useVersionHistory({ directoryUri, latestContent })
    const { onRunAction, linkSheet, tableSheet, imageSheet } = useMarkdownInsertSheets(markdownAction)

    const tagsSheet = useBottomSheet()
    const templatesSheet = useBottomSheet()
    const recentsSheet = useBottomSheet()
    const searchSheet = useBottomSheet()

    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + '\n\n' + content : content))
        templatesSheet.onClose()
    }, [])

    const onSaveAsTemplate = useCallback(async () => {
        const { title, content } = latestContent.current

        try {
            await addTemplate(title.trim() || t('placeholder.title'), content)
            listTemplates().then(setTemplates)
            showSnackbar(t('templates.saved'))
        } catch (error) {
            console.log(error)
            showSnackbar(t('templates.save_failed'))
        }
    }, [addTemplate, listTemplates, t])

    const onOpenExportDialog = useCallback(() => setExportDialogVisible(true), [])
    const onCloseExportDialog = useCallback(() => setExportDialogVisible(false), [])
    const onConfirmExport = useCallback(async (format) => {
        await flush()
        exportFile(id, format)
    }, [flush, exportFile, id])

    const onOpenShareDialog = useCallback(() => setShareDialogVisible(true), [])
    const onCloseShareDialog = useCallback(() => setShareDialogVisible(false), [])
    const onConfirmShare = useCallback(async (format) => {
        await flush()
        shareFile(id, format)
    }, [flush, shareFile, id])

    const onOpenDeleteDialog = useCallback(() => setDeleteDialogVisible(true), [])
    const onToggleShowBacklinks = useCallback(() => setShowBacklinks((prev) => !prev), [])
    const onCloseDeleteDialog = useCallback(() => setDeleteDialogVisible(false), [])
    const onConfirmDelete = useCallback(async () => {
        await deleteNote(id)
        setParamId('')
        router.back()
    }, [deleteNote, setParamId, id])

    const onRestoreVersion = useCallback((version) => {
        setTitle(version.title)
        setNote(version.content)
        versionHistory.onClose()
    }, [versionHistory.onClose])

    useEffect(() => {
        listTemplates().then(setTemplates)
    }, [])

    const actions = useMemo(() => ({
        onOpenTags: tagsSheet.onOpen,
        onOpenTemplates: templatesSheet.onOpen,
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch: searchSheet.onOpen,
        onSaveAsTemplate
    }), [
        tagsSheet.onOpen,
        templatesSheet.onOpen,
        recentsSheet.onOpen,
        searchSheet.onOpen,
        onSaveAsTemplate
    ])

    return (
        <VersionHistoryPanel
            visible={versionHistory.visible}
            onOpen={versionHistory.onOpen}
            onClose={versionHistory.onClose}
            swipeEnabled={pro}
            panelContent={(
                <VersionHistoryContent
                    directoryUri={directoryUri}
                    noteId={id}
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
                        isFocused={isFocused}
                        search={search}
                        onOpenVersionHistory={versionHistory.onOpen}
                        onOpenExportDialog={onOpenExportDialog}
                        onOpenShareDialog={onOpenShareDialog}
                        onOpenDeleteDialog={onOpenDeleteDialog}
                        showBacklinks={showBacklinks}
                        onToggleShowBacklinks={onToggleShowBacklinks}
                    />
                )}
            />

            <MarkdownSearchBar
                search={search}
                onPrevious={() => markdownAction.run('search-previous')}
                onNext={() => markdownAction.run('search-next')}
                onReplaceOne={() => markdownAction.run('search-replace')}
                onReplaceAll={() => markdownAction.run('search-replace-all')}
            />

            <MarkdownEditorLayout
                mode={mode}
                isFocused={isFocused}
                onRunAction={onRunAction}
                actions={actions}
                canUndo={canUndo}
                canRedo={canRedo}
            >
                <MarkdownInput
                    id={id}
                    mode={mode}
                    title={title}
                    setTitle={setTitle}
                    onTitleBlur={onTitleBlur}
                    titlePlaceholder={t('placeholder.title')}
                    metaLabel={metaLabel}
                    searchQuery={search.searchQuery}
                    replaceText={search.replaceText}
                    value={note}
                    onChangeText={setNote}
                    onHistoryChange={onHistoryChange}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={t('placeholder.note')}
                    action={markdownAction.action}
                    payload={markdownAction.payload}
                    onActionHandled={markdownAction.clear}
                    showBacklinks={showBacklinks}
                />
            </MarkdownEditorLayout>

            <ModalSheet
                ref={tagsSheet.ref}
                onClose={tagsSheet.onClose}
                snapPoints={['50%', '95%']}
            >
                <Tags
                    tags={tags}
                    setTags={setTags}
                />
            </ModalSheet>

            <MarkdownInsertSheets
                linkSheet={linkSheet}
                tableSheet={tableSheet}
                imageSheet={imageSheet}
                markdownAction={markdownAction}
            />

            <TemplatePickerSheet
                sheet={templatesSheet}
                title={title}
                templates={templates}
                onSelect={onSelectTemplate}
            />

            <RecentNotesSheet sheet={recentsSheet} />

            <ExportFormat
                title={t('export.export_title')}
                visible={exportDialogVisible}
                onDismiss={onCloseExportDialog}
                onConfirm={onConfirmExport}
            />

            <ExportFormat
                title={t('export.share_title')}
                visible={shareDialogVisible}
                onDismiss={onCloseShareDialog}
                onConfirm={onConfirmShare}
            />

            <ConfirmDialog
                visible={deleteDialogVisible}
                title={t('notes.delete_title')}
                message={t('notes.delete_message')}
                confirmLabel={t('button.delete')}
                onDismiss={onCloseDeleteDialog}
                onConfirm={onConfirmDelete}
            />

            <NoteSearchSheet sheet={searchSheet} />
        </VersionHistoryPanel>
    )
}
