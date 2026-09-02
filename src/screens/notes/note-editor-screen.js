import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AppBar, MarkdownEditor, ModalSheet } from '@/components'
import { MarkdownEditorLayout } from './markdown-editor-layout'
import { MarkdownModeToggle } from './markdown-mode-toggle'
import { TemplateCarousel } from './template-carousel'
import { RecentNotes } from './recent-notes'
import { VersionHistoryPanel } from './version-history-panel'
import { VersionHistoryContent } from './version-history-content'
import { Tags } from '@/screens/modals/tags'
import { LinkMarkdown } from '@/screens/modals/link-markdown'
import { TableMarkdown } from '@/screens/modals/table-markdown'
import { ImageMarkdown } from '@/screens/modals/image-markdown'
import {
    useAllowLandscape,
    useBottomSheet,
    useLanguage,
    useMarkdownAction,
    useNoteVersions,
    usePremium,
    useRepositories,
    useTemplates
} from '@/hooks'
import { getFormattedDate } from '@/utils'

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
    const { addTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()
    const { premium } = usePremium()
    const { repositories } = useRepositories()
    const { commitVersion } = useNoteVersions()

    const directoryUri = repositories.find((repository) => repository.id === repositoryId)?.uri

    useAllowLandscape()

    const dateLabel = (createdAt || updatedAt)
        ? `${updatedAt ? t('date.updated') : t('date.created')} ${getFormattedDate(updatedAt || createdAt, currentLanguage)}`
        : ''

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)
    const [versionHistoryVisible, setVersionHistoryVisible] = useState(false)
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

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
        if (!premium) {
            ToastAndroid.show(t('repositories.pro_required'), ToastAndroid.SHORT)
            return
        }

        setVersionHistoryVisible(true)
    }, [premium])

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

    const latestContent = useRef({ title, note })
    latestContent.current = { title, note }

    const onSaveAsTemplate = useCallback(async () => {
        const { title, note } = latestContent.current
        await addTemplate(title.trim() || t('placeholder.title'), note)
        ToastAndroid.show(t('templates.saved'), ToastAndroid.SHORT)
    }, [])

    const onCloseVersionHistory = useCallback(() => setVersionHistoryVisible(false), [])

    const onRestoreVersion = useCallback((version) => {
        setTitle(version.title)
        setNote(version.content)
        setVersionHistoryVisible(false)
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
            premium={premium}
            onRestore={onRestoreVersion}
        />
    ), [directoryUri, id, note, premium, onRestoreVersion])

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
            swipeEnabled={premium}
            panelContent={versionHistoryPanelContent}
        >
            <AppBar
                trailing={(
                    <MarkdownModeToggle
                        mode={mode}
                        onSetMode={setMode}
                        onOpenVersionHistory={onOpenVersionHistory}
                    />
                )}
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
                    dateLabel={dateLabel}
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

            <ModalSheet
                ref={templatesSheet.ref}
                onClose={templatesSheet.onClose}
                contentContainerStyle={{ paddingVertical: 16 }}
            >
                <TemplateCarousel
                    title={title}
                    onSelect={onSelectTemplate}
                />
            </ModalSheet>

            <ModalSheet
                ref={recentsSheet.ref}
                onClose={recentsSheet.onClose}
                title={t('search.recent')}
            >
                <RecentNotes onClose={recentsSheet.onClose} />
            </ModalSheet>
        </VersionHistoryPanel>
    )
}
