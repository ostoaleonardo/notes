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
import { AppBar } from '@/components/app-bar/app-bar'
import { MarkdownEditor } from '@/components/markdown/markdown-editor'
import { ModalSheet } from '@/components/modal/modal-sheet'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

import { useAllowLandscape } from '@/hooks/use-allow-landscape'
import { useBottomSheet } from '@/hooks/use-bottom-sheet'
import { useLanguage } from '@/hooks/use-language'
import { useMarkdownAction } from '@/hooks/use-markdown-action'
import { useNoteVersions } from '@/hooks/use-note-versions'
import { usePro } from '@/hooks/use-pro'
import { useRepositories } from '@/hooks/use-repositories'
import { useTemplates } from '@/hooks/use-templates'
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
    const { currentLanguage } = useLanguage()
    const { pro } = usePro()
    const { repositories } = useRepositories()
    const { commitVersion } = useNoteVersions()

    const directoryUri = repositories.find((repository) => repository.id === repositoryId)?.uri

    useAllowLandscape()

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)
    const [searchVisible, setSearchVisible] = useState(false)
    const [replaceVisible, setReplaceVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [replaceText, setReplaceText] = useState('')
    const [versionHistoryVisible, setVersionHistoryVisible] = useState(false)
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

    const onOpenVersionHistory = useCallback(() => {
        setVersionHistoryVisible(true)
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

    const onOpenSearch = useCallback(() => {
        setSearchVisible(true)
        setReplaceVisible(false)
    }, [])

    const onOpenReplace = useCallback(() => {
        setSearchVisible(true)
        setReplaceVisible(true)
    }, [])

    const onCloseSearch = useCallback(() => {
        setSearchVisible(false)
        setReplaceVisible(false)
        setSearchQuery('')
        setReplaceText('')
    }, [])

    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + '\n\n' + content : content))
        templatesSheet.onClose()
    }, [])

    const latestContent = useRef({ title, note })
    latestContent.current = { title, note }

    const onSaveAsTemplate = useCallback(async () => {
        const { title, note } = latestContent.current
        await addTemplate(title.trim() || t('placeholder.title'), note)
        listTemplates().then(setTemplates)
        showSnackbar(t('templates.saved'))
    }, [addTemplate, listTemplates, t])

    const onCloseVersionHistory = useCallback(() => setVersionHistoryVisible(false), [])

    const onRestoreVersion = useCallback((version) => {
        setTitle(version.title)
        setNote(version.content)
        setVersionHistoryVisible(false)
    }, [])

    useEffect(() => {
        listTemplates().then(setTemplates)
    }, [])

    useEffect(() => {
        if (!directoryUri || !id) return

        return () => {
            const { title, note } = latestContent.current
            commitVersion(directoryUri, id, title, note)
        }
    }, [directoryUri, id])

    const versionHistoryPanelContent = useMemo(() => (
        <VersionHistoryContent
            directoryUri={directoryUri}
            noteId={id}
            currentContent={note}
            pro={pro}
            onRestore={onRestoreVersion}
            onClose={onCloseVersionHistory}
        />
    ), [directoryUri, id, note, pro, onRestoreVersion, onCloseVersionHistory])

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
            visible={versionHistoryVisible}
            onOpen={onOpenVersionHistory}
            onClose={onCloseVersionHistory}
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
                        onOpenSearch={onOpenSearch}
                        onOpenReplace={onOpenReplace}
                        onOpenVersionHistory={onOpenVersionHistory}
                    />
                )}
            />

            <MarkdownSearchBar
                visible={searchVisible}
                replaceVisible={replaceVisible}
                query={searchQuery}
                onQueryChange={setSearchQuery}
                replacement={replaceText}
                onReplacementChange={setReplaceText}
                onPrevious={() => markdownAction.run('search-previous')}
                onNext={() => markdownAction.run('search-next')}
                onReplaceOne={() => markdownAction.run('search-replace')}
                onReplaceAll={() => markdownAction.run('search-replace-all')}
                onClose={onCloseSearch}
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
                    searchQuery={searchVisible ? searchQuery : ''}
                    replaceText={replaceText}
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
        </VersionHistoryPanel>
    )
}
