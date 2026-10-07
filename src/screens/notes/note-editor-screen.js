import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OutgoingLinksSheet } from './outgoing-links-sheet'
import { OutlineSheet } from './outline-sheet'
import { TemplatePickerSheet } from './template-picker-sheet'
import { TagsSheet } from './tags-sheet'
import { EditorShell } from './editor-shell'
import { ExportFormat } from '@/screens/dialogs/export-format'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MarkdownInput } from '@/components/markdown/markdown-input'

import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useEditorChrome } from '@/hooks/use-editor-chrome'
import { useLanguage } from '@/hooks/use-language'
import { useNoteDelete } from '@/hooks/use-note-delete'
import { useNoteMode } from '@/hooks/use-note-mode'
import { useNoteSharing } from '@/hooks/use-note-sharing'
import { useNoteTemplates } from '@/hooks/use-note-templates'
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
    anchor,
    flush,
    busyRef
}) => {
    const { t } = useTranslation()
    const { currentLanguage } = useLanguage()
    const { repositories } = useRepositories()
    const location = useMemo(
        () => getVersionLocation(repositories, repositoryId),
        [repositories, repositoryId]
    )

    const [showBacklinks, setShowBacklinks] = useState(true)
    const chrome = useEditorChrome()
    const {
        onFocus,
        onBlur,
        recentsSheet,
        searchSheet,
        action,
        search,
        onHistoryChange
    } = chrome

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

    const onEdit = useCallback(() => onSetMode(EDITOR_MODES.LIVE), [onSetMode])

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
    const outlineSheet = useBottomSheet()
    const outgoingLinksSheet = useBottomSheet()

    const [jump, setJump] = useState(null)
    const onSelectHeading = useCallback((index) => {
        setJump((prev) => ({ index, nonce: (prev?.nonce ?? 0) + 1 }))
    }, [])
    const onJumpToAnchor = useCallback((value) => {
        setJump((prev) => ({ anchor: value, nonce: (prev?.nonce ?? 0) + 1 }))
    }, [])
    const { dialog: sharingDialog, onConfirmExport, onConfirmShare } = useNoteSharing({ id, flush })
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

    const toggleProps = useMemo(() => ({
        showBacklinks,
        onOpenSharingDialog: sharingDialog.onOpen,
        onOpenDeleteDialog: noteDelete.onOpen,
        onOpenOutline: outlineSheet.onOpen,
        onOpenOutgoingLinks: outgoingLinksSheet.onOpen,
        onToggleShowBacklinks
    }), [
        showBacklinks,
        sharingDialog.onOpen,
        noteDelete.onOpen,
        outlineSheet.onOpen,
        outgoingLinksSheet.onOpen,
        onToggleShowBacklinks
    ])

    return (
        <EditorShell
            mode={mode}
            chrome={chrome}
            actions={actions}
            noteId={filename}
            location={location}
            onSetMode={onSetMode}
            contentRef={latestContent}
            onRestore={onRestore}
            toggleProps={toggleProps}
            repositoryId={repositoryId}
            initialSearch={searchSeed}
            versionHistory={versionHistory}
            sheets={(
                <>
                    <OutlineSheet
                        sheet={outlineSheet}
                        contentRef={latestContent}
                        onSelect={onSelectHeading}
                    />

                    <OutgoingLinksSheet
                        sheet={outgoingLinksSheet}
                        contentRef={latestContent}
                        selfPath={id}
                    />

                    <TagsSheet
                        sheet={tagsSheet}
                        tags={tags}
                        setTags={setTags}
                    />

                    <TemplatePickerSheet
                        sheet={noteTemplates.sheet}
                        title={title}
                        templates={noteTemplates.templates}
                        onSelect={noteTemplates.onSelect}
                        onSaveAsTemplate={noteTemplates.onSaveAsTemplate}
                    />

                    <ExportFormat
                        title={t('export.title')}
                        visible={sharingDialog.visible}
                        onDismiss={sharingDialog.onClose}
                        onExport={onConfirmExport}
                        onShare={onConfirmShare}
                    />

                    <ConfirmDialog
                        visible={noteDelete.visible}
                        title={t('notes.delete_title')}
                        message={t(`notes.delete_message_${noteDelete.behavior}`)}
                        confirmLabel={t('button.delete')}
                        onDismiss={noteDelete.onClose}
                        onConfirm={noteDelete.onConfirm}
                    />
                </>
            )}
        >
            <MarkdownInput
                id={id}
                mode={mode}
                onEdit={onEdit}
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
                anchor={jump ? jump.anchor : anchor}
                onJumpToAnchor={onJumpToAnchor}
                headingIndex={jump?.index}
                jumpNonce={jump?.nonce}
                showBacklinks={showBacklinks}
            />
        </EditorShell>
    )
}
