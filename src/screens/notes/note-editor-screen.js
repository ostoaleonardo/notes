import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OutgoingLinksSheet } from './outgoing-links-sheet'
import { MoveNoteSheet } from './move-note-sheet'
import { OutlineSheet } from './outline-sheet'
import { TemplatePickerSheet } from './template-picker-sheet'
import { EditorShell } from './editor-shell'
import { ExportSheet } from '@/screens/dialogs/export-sheet'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MarkdownInput } from '@/components/markdown/markdown-input'

import { useMountedSheet } from '@/hooks/use-mounted-sheet'
import { useEditorChrome } from '@/hooks/use-editor-chrome'
import { useNoteDelete } from '@/hooks/use-note-delete'
import { useNoteMove } from '@/hooks/use-note-move'
import { useEditorJump } from '@/hooks/use-editor-jump'
import { useNoteMode } from '@/hooks/use-note-mode'
import { usePropertiesPanel } from '@/hooks/use-properties-panel'
import { useTitleField } from '@/hooks/use-title-field'
import { useNoteSharing } from '@/hooks/use-note-sharing'
import { useNoteTemplates } from '@/hooks/use-note-templates'
import { useRepositories } from '@/hooks/use-repositories'
import { useTagSearchSeed } from '@/hooks/use-tag-search-seed'
import { useVersionHistory } from '@/hooks/use-version-history'
import { getVersionLocation } from '@/utils/note-version-location'

import { EDITOR_MODES } from '@/constants/editor-modes'

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
    invalidFrontmatter,
    rawFrontmatter,
    update,
    initialMode = EDITOR_MODES.READ,
    anchor,
    flush,
    busyRef,
    onMoved
}) => {
    const { t } = useTranslation()
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

    const { seed: searchSeed, onOpenSearch, onTagPress } = useTagSearchSeed(searchSheet.onOpen)

    const content = useMemo(() => ({
        note,
        tags,
        properties,
        invalidFrontmatter,
        rawFrontmatter
    }), [note, tags, properties, invalidFrontmatter, rawFrontmatter])

    const {
        mode,
        onSetMode,
        editorValue,
        onEditorChange
    } = useNoteMode({ initialMode, content, update, setNote })

    const onEdit = useCallback(() => onSetMode(EDITOR_MODES.LIVE), [onSetMode])

    const {
        propertiesPanel,
        onAddTag,
        onRemoveTag,
        onChangeProperty,
        onToggleProperties
    } = usePropertiesPanel({
        tags,
        properties,
        setTags,
        setProperties,
        invalid: mode !== EDITOR_MODES.CODE && !!invalidFrontmatter
    })

    const searchField = useMemo(() => ({
        query: search.searchQuery,
        replace: search.replaceText
    }), [search.searchQuery, search.replaceText])

    const outlineSheet = useMountedSheet()
    const outgoingLinksSheet = useMountedSheet()

    const jump = useEditorJump(anchor)
    const { sheet: sharingSheet, onConfirmExport, onConfirmShare } = useNoteSharing({ id, flush })
    const noteDelete = useNoteDelete(id, busyRef)
    const noteMove = useNoteMove({ id, busyRef, flush, onMoved })

    const titleField = useTitleField({ id, title, note, mode })

    const latestContent = useRef({ noteId: filename, title, content: note })
    latestContent.current = { noteId: filename, title, content: note }

    const noteTemplates = useNoteTemplates({ latestContent, setNote })

    const onToggleShowBacklinks = useCallback(() => setShowBacklinks((prev) => !prev), [])

    const onRestore = useCallback((version) => {
        if (onRestoreVersion) {
            onRestoreVersion(version)
        } else {
            setTitle(version.title)
            setNote(version.content)
        }
    }, [onRestoreVersion, setTitle, setNote])

    const versionHistory = useVersionHistory({ location, latestContent, onRestore })

    const actions = useMemo(() => ({
        onOpenTemplates: noteTemplates.onOpen,
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch
    }), [
        noteTemplates.onOpen,
        recentsSheet.onOpen,
        onOpenSearch
    ])

    const toggleProps = useMemo(() => ({
        showBacklinks,
        onOpenSharingDialog: sharingSheet.onOpen,
        onOpenDeleteDialog: noteDelete.onOpen,
        onOpenOutline: outlineSheet.onOpen,
        onOpenOutgoingLinks: outgoingLinksSheet.onOpen,
        onOpenMove: noteMove.sheet.onOpen,
        onToggleShowBacklinks
    }), [
        showBacklinks,
        sharingSheet.onOpen,
        noteDelete.onOpen,
        outlineSheet.onOpen,
        outgoingLinksSheet.onOpen,
        noteMove.sheet.onOpen,
        onToggleShowBacklinks
    ])

    return (
        <EditorShell
            mode={mode}
            chrome={chrome}
            actions={actions}
            onSetMode={onSetMode}
            toggleProps={toggleProps}
            repositoryId={repositoryId}
            initialSearch={searchSeed}
            versionHistory={versionHistory}
            sheets={(
                <>
                    {outlineSheet.mounted && (
                        <OutlineSheet
                            contentRef={latestContent}
                            onSelect={jump.onSelectHeading}
                            onClose={outlineSheet.onClose}
                        />
                    )}

                    {outgoingLinksSheet.mounted && (
                        <OutgoingLinksSheet
                            contentRef={latestContent}
                            selfPath={id}
                            onClose={outgoingLinksSheet.onClose}
                        />
                    )}

                    <MoveNoteSheet
                        sheet={noteMove.sheet}
                        repositoryId={repositoryId}
                        onSelect={noteMove.onSelect}
                    />

                    <TemplatePickerSheet
                        sheet={noteTemplates.sheet}
                        title={title}
                        templates={noteTemplates.templates}
                        onSelect={noteTemplates.onSelect}
                        onSaveAsTemplate={noteTemplates.onSaveAsTemplate}
                    />

                    <ExportSheet
                        sheet={sharingSheet}
                        onExport={onConfirmExport}
                        onShare={onConfirmShare}
                    />

                    <ConfirmDialog
                        visible={noteDelete.visible}
                        title={t('notes.delete.title')}
                        message={t(`notes.delete.message.${noteDelete.behavior}`)}
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
                anchor={jump.anchor}
                onJumpToAnchor={jump.onJumpToAnchor}
                headingIndex={jump.headingIndex}
                jumpNonce={jump.jumpNonce}
                showBacklinks={showBacklinks}
            />
        </EditorShell>
    )
}
