import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useEditorChrome } from '@/hooks/use-editor-chrome'
import { useLanguage } from '@/hooks/use-language'
import { useNoteDelete } from '@/hooks/use-note-delete'
import { useNoteMode } from '@/hooks/use-note-mode'
import { useNoteSharing } from '@/hooks/use-note-sharing'
import { useNoteTemplates } from '@/hooks/use-note-templates'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { useShowProperties } from '@/hooks/use-show-properties'
import { useTags } from '@/hooks/use-tags'
import { useTagSearchSeed } from '@/hooks/use-tag-search-seed'
import { useVersionHistory } from '@/hooks/use-version-history'
import { buildNoteMetaLabel } from '@/utils/note-meta-label'
import { countWords } from '@/utils/word-count'
import {
    applyPropertyChange,
    buildPropertyRows,
    buildPropertySuggestions
} from '@/utils/properties'
import { hasTag, isValidTagName, sanitizeTagName } from '@/utils/tag-names'
import { getVersionLocation } from '@/utils/note-version-location'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { EDITABLE_PROPERTY_TYPES } from '@/constants/properties'

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
    rawFrontmatter, setRawFrontmatter,
    modifiedAt,
    initialMode = EDITOR_MODES.READ,
    blockId,
    flush,
    busyRef
}) => {
    const { t } = useTranslation()
    const { pro } = usePro()
    const { currentLanguage } = useLanguage()
    const { repositories } = useRepositories()
    const location = useMemo(
        () => getVersionLocation(repositories, repositoryId),
        [repositories, repositoryId]
    )

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

    const { seed: searchSeed, onOpenSearch, onTagPress } = useTagSearchSeed(searchSheet.onOpen)

    const onRemoveTag = useCallback((name) => {
        setTags((prev) => prev.filter((tag) => tag !== name))
    }, [setTags])

    const onAddTag = useCallback((name) => {
        const clean = sanitizeTagName(name)
        if (!isValidTagName(clean)) return

        setTags((prev) => hasTag(prev, clean) ? prev : [...prev, clean])
    }, [setTags])

    const onChangeProperty = useCallback((change) => {
        setProperties((prev) => applyPropertyChange(prev, change))
    }, [setProperties])

    const { tags: allTags } = useTags()

    const {
        mode,
        onSetMode,
        editorValue,
        onEditorChange
    } = useNoteMode({
        initialMode,
        note,
        tags,
        properties,
        invalidFrontmatter,
        rawFrontmatter,
        setNote,
        setTags,
        setProperties,
        setInvalidFrontmatter,
        setRawFrontmatter
    })

    const invalid = mode !== EDITOR_MODES.CODE && !!invalidFrontmatter

    const propertyLabels = useMemo(() => ({
        add: t('properties.add'),
        remove: t('properties.remove'),
        namePlaceholder: t('properties.name_placeholder'),
        valuePlaceholder: t('properties.value_placeholder'),
        types: Object.fromEntries(
            EDITABLE_PROPERTY_TYPES.map((type) => [type, t(`properties.type_${type}`)])
        )
    }), [t])

    const rows = useMemo(() => buildPropertyRows(properties), [properties])

    const suggestions = useMemo(() => (
        buildPropertySuggestions({ properties, tags })
    ), [properties, tags])

    const propertiesPanel = useMemo(() => ({
        tags,
        allTags,
        rows,
        suggestions,
        labels: propertyLabels,
        label: t('title.tags'),
        visible: propertiesVisible,
        invalid,
        invalidTitle: t('tags.invalid_properties_title'),
        invalidDescription: t('tags.invalid_properties_description')
    }), [tags, allTags, rows, suggestions, propertyLabels, t, propertiesVisible, invalid])

    const searchField = useMemo(() => ({
        query: search.searchQuery,
        replace: search.replaceText
    }), [search.searchQuery, search.replaceText])

    const tagsSheet = useBottomSheet()
    const { shareDialog, exportDialog, onConfirmExport, onConfirmShare } = useNoteSharing({ id, flush })
    const noteDelete = useNoteDelete(id, busyRef)

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
    const { onClose: closeVersionHistory } = versionHistory

    const noteTemplates = useNoteTemplates({ latestContent, setNote })

    const onToggleShowBacklinks = useCallback(() => setShowBacklinks((prev) => !prev), [])

    const onRestore = useCallback((version) => {
        if (onRestoreVersion) {
            onRestoreVersion(version)
        } else {
            setTitle(version.title)
            setNote(version.content)
        }

        closeVersionHistory()
    }, [onRestoreVersion, setTitle, setNote, closeVersionHistory])

    const actions = useMemo(() => ({
        onOpenTags: tagsSheet.onOpen,
        onOpenTemplates: noteTemplates.onOpen,
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch
    }), [
        tagsSheet.onOpen,
        noteTemplates.onOpen,
        recentsSheet.onOpen,
        onOpenSearch
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
                        onOpenDeleteDialog={noteDelete.onOpen}
                        onSaveAsTemplate={noteTemplates.onSaveAsTemplate}
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
                    propertiesPanel={propertiesPanel}
                    onToggleProperties={onToggleProperties}
                    onChangeProperty={onChangeProperty}
                    onRemoveTag={onRemoveTag}
                    onAddTag={onAddTag}
                    onTagPress={onTagPress}
                    search={searchField}
                    value={editorValue}
                    onChangeText={onEditorChange}
                    onHistoryChange={onHistoryChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    placeholder={t('placeholder.note')}
                    action={action}
                    blockId={blockId}
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
                repositoryId={repositoryId}
                action={action}
            />

            <TemplatePickerSheet
                sheet={noteTemplates.sheet}
                title={title}
                templates={noteTemplates.templates}
                onSelect={noteTemplates.onSelect}
            />

            <NoteToolbarSheets
                recentsSheet={recentsSheet}
                searchSheet={searchSheet}
                initialSearch={searchSeed}
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
                visible={noteDelete.visible}
                title={t('notes.delete_title')}
                message={t(`notes.delete_message_${noteDelete.behavior}`)}
                confirmLabel={t('button.delete')}
                onDismiss={noteDelete.onClose}
                onConfirm={noteDelete.onConfirm}
            />
        </VersionHistoryPanel>
    )
}
