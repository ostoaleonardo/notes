import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router'

import { MarkdownEditorLayout } from './markdown-editor-layout'
import { MarkdownModeToggle } from './markdown-mode-toggle'
import { MarkdownSearchBar } from './markdown-search-bar'
import { MarkdownInsertSheets } from './markdown-insert-sheets'
import { TemplatePickerSheet } from './template-picker-sheet'
import { NoteToolbarSheets } from './note-toolbar-sheets'
import { TagsSheet } from './tags-sheet'
import { VersionHistoryPanel } from './version-history-panel'
import { VersionHistoryContent } from './version-history-content'
import { ExportFormat } from '@/screens/dialogs/export-format'
import { AppBar } from '@/components/app-bar/app-bar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MarkdownInput } from '@/components/markdown/markdown-input'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAllowLandscape } from '@/hooks/use-allow-landscape'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useFiles } from '@/hooks/use-files'
import { useLanguage } from '@/hooks/use-language'
import { useMarkdownAction } from '@/hooks/use-markdown-action'
import { useMarkdownSheets } from '@/hooks/use-markdown-sheets'
import { useMarkdownSearch } from '@/hooks/use-markdown-search'
import { useMenuAction } from '@/hooks/use-menu-action'
import { useNotes } from '@/hooks/use-notes'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useTemplatesList } from '@/hooks/use-templates-list'
import { useUndoRedoState } from '@/hooks/use-undo-redo-state'
import { useVersionHistory } from '@/hooks/use-version-history'
import { buildNoteMetaLabel } from '@/utils/note-meta-label'
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
    const { pro } = usePro()
    const { deleteNote } = useNotes()
    const { addTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()
    const { repositories } = useRepositories()
    const { exportFile, shareFile } = useFiles()
    const { canUndo, canRedo, onHistoryChange } = useUndoRedoState()
    const { templates, refresh: refreshTemplates } = useTemplatesList()

    const directoryUri = repositories.find((repository) => repository.id === repositoryId)?.uri

    useAllowLandscape()

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)
    const [showBacklinks, setShowBacklinks] = useState(true)

    const shareDialog = useMenuAction()
    const exportDialog = useMenuAction()
    const deleteDialog = useMenuAction()

    const tagsSheet = useBottomSheet()
    const searchSheet = useBottomSheet()
    const recentsSheet = useBottomSheet()
    const templatesSheet = useBottomSheet()

    const { words, characters } = countWords(note)

    const metaLabel = useMemo(() => (
        buildNoteMetaLabel({
            showDate: mode === 'read',
            language: currentLanguage,
            timestamp: updatedAt || createdAt,
            dateLabel: updatedAt ? t('date.updated') : t('date.created'),
            words,
            wordsLabel: t('count.words', { count: words }),
            charactersLabel: t('count.characters', { count: characters })
        })
    ), [
        t,
        mode,
        words,
        createdAt,
        updatedAt,
        characters,
        currentLanguage
    ])

    const latestContent = useRef({ noteId: id, title, content: note })
    latestContent.current = { noteId: id, title, content: note }

    const versionHistory = useVersionHistory({ directoryUri, latestContent })

    const action = useMarkdownAction()
    const search = useMarkdownSearch()

    const {
        onRunAction,
        linkSheet,
        tableSheet,
        imageSheet
    } = useMarkdownSheets(action)


    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + '\n\n' + content : content))
        templatesSheet.onClose()
    }, [])

    const onSaveAsTemplate = useCallback(async () => {
        const { title, content } = latestContent.current

        try {
            await addTemplate(title.trim() || t('placeholder.title'), content)
            refreshTemplates()
            showSnackbar(t('templates.saved'))
        } catch (error) {
            console.debug('error saving template', error)
            showSnackbar(t('templates.save_failed'))
        }
    }, [addTemplate, refreshTemplates, t])

    const onConfirmExport = useCallback(async (format) => {
        await flush()
        exportFile(id, format)
    }, [flush, exportFile, id])

    const onConfirmShare = useCallback(async (format) => {
        await flush()
        shareFile(id, format)
    }, [flush, shareFile, id])

    const onToggleShowBacklinks = useCallback(() => setShowBacklinks((prev) => !prev), [])

    const onConfirmDelete = useCallback(async () => {
        try {
            await deleteNote(id)
            router.back()
        } catch (error) {
            console.debug('error deleting note', error)
            showSnackbar(t('notes.delete_failed'))
        }
    }, [deleteNote, id, t])

    const onRestoreVersion = useCallback((version) => {
        setTitle(version.title)
        setNote(version.content)
        versionHistory.onClose()
    }, [versionHistory.onClose])

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
                    pro={pro}
                    noteId={id}
                    directoryUri={directoryUri}
                    currentContentRef={latestContent}
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
                        search={search}
                        onSetMode={setMode}
                        isFocused={isFocused}
                        showBacklinks={showBacklinks}
                        onOpenShareDialog={shareDialog.onOpen}
                        onOpenExportDialog={exportDialog.onOpen}
                        onOpenDeleteDialog={deleteDialog.onOpen}
                        onOpenVersionHistory={versionHistory.onOpen}
                        onToggleShowBacklinks={onToggleShowBacklinks}
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
                actions={actions}
                canUndo={canUndo}
                canRedo={canRedo}
            >
                <MarkdownInput
                    id={id}
                    mode={mode}
                    titleField={{
                        title,
                        onTitleChange: setTitle,
                        onTitleBlur,
                        titlePlaceholder: t('placeholder.title'),
                        metaLabel
                    }}
                    searchQuery={search.searchQuery}
                    replaceText={search.replaceText}
                    value={note}
                    onChangeText={setNote}
                    onHistoryChange={onHistoryChange}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={t('placeholder.note')}
                    action={action}
                    showBacklinks={showBacklinks}
                />
            </MarkdownEditorLayout>

            <TagsSheet
                sheet={tagsSheet}
                tags={tags}
                setTags={setTags}
            />

            <MarkdownInsertSheets
                linkSheet={linkSheet}
                tableSheet={tableSheet}
                imageSheet={imageSheet}
                action={action}
            />

            <TemplatePickerSheet
                sheet={templatesSheet}
                title={title}
                templates={templates}
                onSelect={onSelectTemplate}
            />

            <NoteToolbarSheets
                recentsSheet={recentsSheet}
                searchSheet={searchSheet}
            />

            <ExportFormat
                title={t('export.export_title')}
                visible={exportDialog.visible}
                onDismiss={exportDialog.onClose}
                onConfirm={onConfirmExport}
            />

            <ExportFormat
                title={t('export.share_title')}
                visible={shareDialog.visible}
                onDismiss={shareDialog.onClose}
                onConfirm={onConfirmShare}
            />

            <ConfirmDialog
                visible={deleteDialog.visible}
                title={t('notes.delete_title')}
                message={t('notes.delete_message')}
                confirmLabel={t('button.delete')}
                onDismiss={deleteDialog.onClose}
                onConfirm={onConfirmDelete}
            />
        </VersionHistoryPanel>
    )
}
