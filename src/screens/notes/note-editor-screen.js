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
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { useTags } from '@/hooks/use-tags'
import { useTemplates } from '@/hooks/use-templates'
import { useTemplatesList } from '@/hooks/use-templates-list'
import { useUndoRedoState } from '@/hooks/use-undo-redo-state'
import { useVersionHistory } from '@/hooks/use-version-history'
import { buildNoteFileContent, parseFrontmatter } from '@/utils/frontmatter'
import { buildNoteMetaLabel } from '@/utils/note-meta-label'
import { countWords } from '@/utils/word-count'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export const NoteEditorScreen = ({
    id,
    filename,
    repositoryId,
    title, setTitle,
    onTitleBlur,
    note, setNote,
    tags, setTags,
    invalidFrontmatter, setInvalidFrontmatter,
    modifiedAt,
    initialMode = EDITOR_MODES.READ,
    flush
}) => {
    const { t } = useTranslation()
    const { pro } = usePro()
    const { setItem } = useStorage()
    const { deleteNote } = useNotes()
    const { addTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()
    const { repositories } = useRepositories()
    const { tags: allTags, addTag } = useTags()
    const { exportFile, shareFile } = useFiles()
    const { canUndo, canRedo, onHistoryChange } = useUndoRedoState()
    const { templates, refresh: refreshTemplates } = useTemplatesList()
    useAllowLandscape()

    const directoryUri = repositories.find((repository) => repository.id === repositoryId)?.uri

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)
    const [showBacklinks, setShowBacklinks] = useState(true)
    const [propertiesVisible, setPropertiesVisible] = useState(true)

    useStorageEffect(STORAGE_KEYS.SHOW_NOTE_PROPERTIES, (value) => {
        if (value === 'false') setPropertiesVisible(false)
    })

    const onToggleProperties = useCallback(() => {
        setPropertiesVisible((prev) => {
            const next = !prev
            setItem(STORAGE_KEYS.SHOW_NOTE_PROPERTIES, next ? 'true' : 'false')
            return next
        })
    }, [setItem])

    const onRemoveTag = useCallback((name) => {
        setTags((prev) => prev.filter((tag) => tag !== name))
    }, [setTags])

    const [codeBuffer, setCodeBuffer] = useState('')

    const invalidProperties = mode !== EDITOR_MODES.CODE && !!invalidFrontmatter

    const onSetMode = useCallback((nextMode) => {
        if (nextMode === mode) return

        if (nextMode === EDITOR_MODES.CODE) {
            setCodeBuffer(invalidFrontmatter != null
                ? `---\n${invalidFrontmatter}\n---\n\n${note}`
                : buildNoteFileContent({ tags }, note))
        } else if (mode === EDITOR_MODES.CODE) {
            const decomposed = parseFrontmatter(codeBuffer)
            if (decomposed.body !== note) setNote(decomposed.body)

            if (decomposed.error) {
                setInvalidFrontmatter(decomposed.rawFrontmatter)
            } else {
                setInvalidFrontmatter(null)

                const nextTags = Array.isArray(decomposed.frontmatter.tags) ? decomposed.frontmatter.tags : []
                setTags(nextTags)
                nextTags
                    .filter((name) => !allTags.includes(name))
                    .forEach((name) => addTag(name))
            }
        }

        setMode(nextMode)
    }, [mode, tags, note, codeBuffer, invalidFrontmatter, setNote, setTags, setInvalidFrontmatter, allTags, addTag])

    const editorValue = mode === EDITOR_MODES.CODE ? codeBuffer : note

    const onEditorChange = useCallback((value) => {
        if (mode === EDITOR_MODES.CODE) {
            setCodeBuffer(value)
            return
        }
        setNote(value)
    }, [mode, setNote])

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

    const latestContent = useRef({ noteId: filename, title, content: note })
    latestContent.current = { noteId: filename, title, content: note }

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
                    noteId={filename}
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
                        onSetMode={onSetMode}
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
                        titlePlaceholder: t('placeholder.title'),
                        metaLabel
                    }}
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
