import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AppBar, MarkdownEditor, ModalSheet, RecentsButton } from '@/components'
import { MarkdownEditorLayout } from './markdown-editor-layout'
import { TemplateCarousel } from './template-carousel'
import { RecentNotes } from './recent-notes'
import { Tags } from '@/screens/modals/tags'
import { LinkMarkdown } from '@/screens/modals/link-markdown'
import { TableMarkdown } from '@/screens/modals/table-markdown'
import { ImageMarkdown } from '@/screens/modals/image-markdown'
import { useAllowLandscape, useBottomSheet, useLanguage, useMarkdownAction, useTemplates } from '@/hooks'
import { getFormattedDate } from '@/utils'

export const NoteEditorScreen = ({
    title, setTitle,
    note, setNote,
    tags, setTags,
    createdAt, updatedAt,
    initialMode = 'read'
}) => {
    const { t } = useTranslation()
    const { addTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()

    useAllowLandscape()

    const dateLabel = (createdAt || updatedAt)
        ? `${updatedAt ? t('date.updated') : t('date.created')} ${getFormattedDate(updatedAt || createdAt, currentLanguage)}`
        : ''

    const [mode, setMode] = useState(initialMode)
    const [isFocused, setIsFocused] = useState(false)

    const markdownAction = useMarkdownAction()

    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()
    const tagsSheet = useBottomSheet()
    const templatesSheet = useBottomSheet()
    const recentsSheet = useBottomSheet()

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

    const actions = useMemo(() => ({
        onOpenTags: tagsSheet.onOpen,
        onOpenTemplates: templatesSheet.onOpen,
        onSaveAsTemplate
    }), [
        tagsSheet.onOpen,
        templatesSheet.onOpen,
        onSaveAsTemplate
    ])

    return (
        <>
            <AppBar
                trailing={<RecentsButton onPress={recentsSheet.onOpen} />}
            />

            <MarkdownEditorLayout
                mode={mode}
                isFocused={isFocused}
                onRunAction={onRunAction}
                onSetMode={setMode}
                actions={actions}
            >
                <MarkdownEditor
                    mode={mode}
                    title={title}
                    setTitle={setTitle}
                    titlePlaceholder={t('placeholder.title')}
                    dateLabel={dateLabel}
                    value={note}
                    setValue={setNote}
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
        </>
    )
}
