import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MarkdownEditorLayout } from './markdown-editor-layout'
import { MarkdownModeToggle } from './markdown-mode-toggle'
import { MarkdownSearchBar } from './markdown-search-bar'
import { TemplatePickerSheet } from './template-picker-sheet'
import { RecentNotesSheet } from './recent-notes-sheet'
import { VersionHistoryPanel } from './version-history-panel'
import { VersionHistoryContent } from './version-history-content'
import { Tags } from '@/screens/modals/tags'
import { LinkMarkdown } from '@/screens/modals/link-markdown'
import { TableMarkdown } from '@/screens/modals/table-markdown'
import { ImageMarkdown } from '@/screens/modals/image-markdown'
import { ExportFormat } from '@/screens/modals/export-format'
import { AppBar } from '@/components/app-bar/app-bar'
import { MarkdownEditor } from '@/components/markdown/markdown-editor'
import { ModalSheet } from '@/components/modal/modal-sheet'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAllowLandscape } from '@/hooks/use-allow-landscape'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useFiles } from '@/hooks/use-files'
import { useLanguage } from '@/hooks/use-language'
import { useMarkdownAction } from '@/hooks/use-markdown-action'
import { useMarkdownSearch } from '@/hooks/use-markdown-search'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
import { useVersionHistory } from '@/hooks/use-version-history'
import { getFormattedDate } from '@/utils/formatted-date'
import { countWords } from '@/utils/word-count'

export const NoteEditorScreen = ({
    id,
    repositoryId,
    title, setTitle,
    note, setNote,
    tags, setTags,
    createdAt, updatedAt,
    initialMode = 'read'
}) => {
    const { t } = useTranslation()
    const { addTemplate, listTemplates } = useTemplates()
    const { exportFile, shareFile } = useFiles()
    const { currentLanguage } = useLanguage()
    const { pro } = usePro()
    const { repositories } = useRepositories()

    const directoryUri = repositories.find((repository) => repository.id === repositoryId)?.uri

    useAllowLandscape()

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)
    const [exportDialogVisible, setExportDialogVisible] = useState(false)
    const [shareDialogVisible, setShareDialogVisible] = useState(false)
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)
    const [templates, setTemplates] = useState([])

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

    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()
    const tagsSheet = useBottomSheet()
    const templatesSheet = useBottomSheet()
    const recentsSheet = useBottomSheet()

    const onHistoryChange = useCallback(({ canUndo, canRedo }) => {
        setCanUndo(canUndo)
        setCanRedo(canRedo)
    }, [])

    const onRunAction = useCallback((action) => {
        if (action === 'link') {
            linkSheet.onOpen()
            return
        }

        if (action === 'table') {
            tableSheet.onOpen()
            return
        }

        if (action === 'image') {
            imageSheet.onOpen()
            return
        }

        markdownAction.run(action)
    }, [
        linkSheet.onOpen,
        tableSheet.onOpen,
        imageSheet.onOpen
    ])

    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + '\n\n' + content : content))
        templatesSheet.onClose()
    }, [])

    const onSaveAsTemplate = useCallback(async () => {
        const { title, content } = latestContent.current
        await addTemplate(title.trim() || t('placeholder.title'), content)
        listTemplates().then(setTemplates)
        showSnackbar(t('templates.saved'))
    }, [addTemplate, listTemplates, t])

    const onOpenExportDialog = useCallback(() => setExportDialogVisible(true), [])
    const onCloseExportDialog = useCallback(() => setExportDialogVisible(false), [])
    const onConfirmExport = useCallback((format) => exportFile(id, format), [exportFile, id])

    const onOpenShareDialog = useCallback(() => setShareDialogVisible(true), [])
    const onCloseShareDialog = useCallback(() => setShareDialogVisible(false), [])
    const onConfirmShare = useCallback((format) => shareFile(id, format), [shareFile, id])

    const onRestoreVersion = useCallback((version) => {
        setTitle(version.title)
        setNote(version.content)
        versionHistory.onClose()
    }, [versionHistory.onClose])

    useEffect(() => {
        listTemplates().then(setTemplates)
    }, [])

    const versionHistoryPanelContent = useMemo(() => (
        <VersionHistoryContent
            directoryUri={directoryUri}
            noteId={id}
            currentContent={note}
            pro={pro}
            onRestore={onRestoreVersion}
            onClose={versionHistory.onClose}
        />
    ), [
        id,
        note,
        pro,
        directoryUri,
        onRestoreVersion,
        versionHistory.onClose
    ])

    const actions = useMemo(() => ({
        onOpenTags: tagsSheet.onOpen,
        onOpenTemplates: templatesSheet.onOpen,
        onOpenRecents: recentsSheet.onOpen,
        onSaveAsTemplate
    }), [
        tagsSheet.onOpen,
        templatesSheet.onOpen,
        recentsSheet.onOpen,
        onSaveAsTemplate
    ])

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
                        isFocused={isFocused}
                        onOpenSearch={search.onOpenSearch}
                        onOpenReplace={search.onOpenReplace}
                        onOpenVersionHistory={versionHistory.onOpen}
                        onOpenExportDialog={onOpenExportDialog}
                        onOpenShareDialog={onOpenShareDialog}
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
                actions={actions}
                canUndo={canUndo}
                canRedo={canRedo}
            >
                <MarkdownEditor
                    mode={mode}
                    title={title}
                    setTitle={setTitle}
                    titlePlaceholder={t('placeholder.title')}
                    metaLabel={metaLabel}
                    searchQuery={search.visible ? search.query : ''}
                    replaceText={search.replacement}
                    value={note}
                    setValue={setNote}
                    onHistoryChange={onHistoryChange}
                    onBlur={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    markdownAction={markdownAction}
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

            <ModalSheet
                enableDynamicSizing
                ref={linkSheet.ref}
                onClose={linkSheet.onClose}
            >
                <LinkMarkdown
                    onClose={linkSheet.onClose}
                    onInsert={(payload) => markdownAction.run('link', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={tableSheet.ref}
                onClose={tableSheet.onClose}
                enablePanDownToClose={false}
            >
                <TableMarkdown
                    onClose={tableSheet.onClose}
                    onInsert={(payload) => markdownAction.run('table', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={imageSheet.ref}
                onClose={imageSheet.onClose}
            >
                <ImageMarkdown
                    onClose={imageSheet.onClose}
                    onInsert={(payload) => markdownAction.run('image', payload)}
                />
            </ModalSheet>

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
        </VersionHistoryPanel>
    )
}
