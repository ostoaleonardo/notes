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

import { useCodeMode } from '@/hooks/use-code-mode'
import { useEditorChrome } from '@/hooks/use-editor-chrome'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useFiles } from '@/hooks/use-files'
import { useLanguage } from '@/hooks/use-language'
import { useMenuAction } from '@/hooks/use-menu-action'
import { useNotes } from '@/hooks/use-notes'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { useShowProperties } from '@/hooks/use-show-properties'
import { useStorage } from '@/hooks/use-storage'
import { useTemplates } from '@/hooks/use-templates'
import { useTemplatesList } from '@/hooks/use-templates-list'
import { useVersionHistory } from '@/hooks/use-version-history'
import { readDeleteBehavior } from '@/utils/delete-note-files'
import { buildNoteMetaLabel } from '@/utils/note-meta-label'
import { countWords } from '@/utils/word-count'
import { getVersionLocation } from '@/utils/note-version-location'

import { DEFAULT_DELETE_BEHAVIOR } from '@/constants/delete-behavior'
import { EDITOR_MODES } from '@/constants/editor-modes'
import { TEMPLATE_INSERT_SEPARATOR } from '@/constants/template-placeholders'

export const NoteEditorScreen = ({
    id,
    filename,
    repositoryId,
    title, setTitle,
    onTitleBlur,
    onRestoreVersion,
    note, setNote,
    tags, setTags,
    properties, setProperties,
    invalidFrontmatter, setInvalidFrontmatter,
    modifiedAt,
    initialMode = EDITOR_MODES.READ,
    flush
}) => {
    const { t } = useTranslation()
    const { pro } = usePro()
    const { deleteNote } = useNotes()
    const { addTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()
    const { repositories } = useRepositories()
    const { exportFile, shareFile } = useFiles()
    const { getItem } = useStorage()
    const { templates, refresh: refreshTemplates } = useTemplatesList([], { immediate: false })
    const location = useMemo(
        () => getVersionLocation(repositories, repositoryId),
        [repositories, repositoryId]
    )

    const [mode, setMode] = useState(initialMode)
    const [showBacklinks, setShowBacklinks] = useState(true)
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

    const { propertiesVisible, onToggleProperties } = useShowProperties()

    const onRemoveTag = useCallback((name) => {
        setTags((prev) => prev.filter((tag) => tag !== name))
    }, [setTags])

    const codeMode = useCodeMode({
        note,
        tags,
        properties,
        invalidFrontmatter,
        setNote,
        setTags,
        setProperties,
        setInvalidFrontmatter
    })

    const invalidProperties = mode !== EDITOR_MODES.CODE && !!invalidFrontmatter

    const onSetMode = useCallback((nextMode) => {
        if (nextMode === mode) return

        if (nextMode === EDITOR_MODES.CODE) codeMode.enter()
        else if (mode === EDITOR_MODES.CODE) codeMode.leave()

        setMode(nextMode)
    }, [mode, codeMode.enter, codeMode.leave])

    const isCodeMode = mode === EDITOR_MODES.CODE
    const editorValue = isCodeMode ? codeMode.codeBuffer : note
    const onEditorChange = isCodeMode ? codeMode.onChange : setNote

    const shareDialog = useMenuAction()
    const exportDialog = useMenuAction()
    const deleteDialog = useMenuAction()
    const [deleteBehavior, setDeleteBehavior] = useState(DEFAULT_DELETE_BEHAVIOR)

    const tagsSheet = useBottomSheet()
    const templatesSheet = useBottomSheet()

    const { words, characters } = countWords(note)

    const metaLabel = useMemo(() => (
        buildNoteMetaLabel({
            showDate: mode === EDITOR_MODES.READ,
            language: currentLanguage,
            timestamp: modifiedAt,
            dateLabel: t('date.updated'),
            words,
            wordsLabel: t('count.words', { count: words }),
            charactersLabel: t('count.characters', { count: characters })
        })
    ), [
        t,
        mode,
        words,
        modifiedAt,
        characters,
        currentLanguage
    ])

    const titleField = useMemo(() => ({
        title,
        titlePlaceholder: t('placeholder.title'),
        metaLabel
    }), [title, t, metaLabel])

    const latestContent = useRef({ noteId: filename, title, content: note })
    latestContent.current = { noteId: filename, title, content: note }

    const versionHistory = useVersionHistory({ location, latestContent })

    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + TEMPLATE_INSERT_SEPARATOR + content : content))
        templatesSheet.onClose()
    }, [])

    const onSaveAsTemplate = useCallback(async () => {
        const { title, content } = latestContent.current

        try {
            await addTemplate(title.trim() || t('placeholder.title'), content)
            showSnackbar(t('templates.saved'))
        } catch (error) {
            console.debug('error saving template', error)
            showSnackbar(t('templates.save_failed'))
        }
    }, [addTemplate, t])

    const onConfirmExport = useCallback(async (format) => {
        await flush()
        exportFile(id, format)
    }, [flush, exportFile, id])

    const onConfirmShare = useCallback(async (format) => {
        await flush()
        shareFile(id, format)
    }, [flush, shareFile, id])

    const onToggleShowBacklinks = useCallback(() => setShowBacklinks((prev) => !prev), [])

    const onOpenDeleteDialog = useCallback(async () => {
        setDeleteBehavior(await readDeleteBehavior(getItem))
        deleteDialog.onOpen()
    }, [getItem, deleteDialog.onOpen])

    const onConfirmDelete = useCallback(async () => {
        try {
            await deleteNote(id)
            router.back()
        } catch (error) {
            console.debug('error deleting note', error)
            showSnackbar(t('notes.delete_failed'))
        }
    }, [deleteNote, id, t])

    const onRestore = useCallback((version) => {
        if (onRestoreVersion) {
            onRestoreVersion(version)
        } else {
            setTitle(version.title)
            setNote(version.content)
        }

        versionHistory.onClose()
    }, [onRestoreVersion, versionHistory.onClose])

    const onOpenTemplates = useCallback(() => {
        refreshTemplates()
        templatesSheet.onOpen()
    }, [refreshTemplates, templatesSheet.onOpen])

    const actions = useMemo(() => ({
        onOpenTags: tagsSheet.onOpen,
        onOpenTemplates,
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch: searchSheet.onOpen,
        onSaveAsTemplate
    }), [
        tagsSheet.onOpen,
        onOpenTemplates,
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
                    noteId={filename}
                    location={location}
                    currentContentRef={latestContent}
                    onRestore={onRestore}
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
                        onSetMode={onSetMode}
                        isFocused={isFocused}
                        showBacklinks={showBacklinks}
                        onOpenShareDialog={shareDialog.onOpen}
                        onOpenExportDialog={exportDialog.onOpen}
                        onOpenDeleteDialog={onOpenDeleteDialog}
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
                    titleField={titleField}
                    onTitleChange={setTitle}
                    onTitleBlur={onTitleBlur}
                    tags={tags}
                    propertiesLabel={t('title.tags')}
                    propertiesVisible={propertiesVisible}
                    onToggleProperties={onToggleProperties}
                    onRemoveTag={onRemoveTag}
                    onOpenTags={tagsSheet.onOpen}
                    invalidProperties={invalidProperties}
                    invalidPropertiesTitle={t('tags.invalid_properties_title')}
                    invalidPropertiesDescription={t('tags.invalid_properties_description')}
                    searchQuery={search.searchQuery}
                    replaceText={search.replaceText}
                    value={editorValue}
                    onChangeText={onEditorChange}
                    onHistoryChange={onHistoryChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
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
                message={t(`notes.delete_message_${deleteBehavior}`)}
                confirmLabel={t('button.delete')}
                onDismiss={deleteDialog.onClose}
                onConfirm={onConfirmDelete}
            />
        </VersionHistoryPanel>
    )
}
