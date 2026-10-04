import { useCallback, useMemo, useState } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import MarkdownDomEditor from './markdown-dom-editor'

import { ConfirmDialog } from '@/components/confirm-dialog'

import { useEditorDisplay } from '@/hooks/use-editor-display'
import { useDomFonts } from '@/hooks/use-dom-fonts'
import { useKatexFonts } from '@/hooks/use-katex-fonts'
import { useTags } from '@/hooks/use-tags'
import { useBacklinksHtml } from '@/hooks/use-backlinks-html'
import { useMissingNote } from '@/hooks/use-missing-note'
import { useBlockIdCreator } from '@/hooks/use-block-id-creator'
import { useMentionLinker } from '@/hooks/use-mention-linker'
import { useNoteEntries } from '@/hooks/use-note-entries'
import { useResolvedPreviewMarkdown } from '@/hooks/use-resolved-preview-markdown'
import { useResolvedWikiLinks } from '@/hooks/use-resolved-wiki-links'
import { useEmbedImageMap } from '@/hooks/use-embed-image-map'
import { useAttachmentFiles } from '@/hooks/use-attachment-files'
import { useOpenFile } from '@/hooks/use-open-file'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { getEditorPath } from '@/utils/editor-path'
import { resolveLinkPress } from '@/utils/link-press'
import { findFileByTarget } from '@/utils/attachments'
import { toggleTask } from '@/utils/tasks'

import { ROUTES } from '@/constants/routes'
import { BODY_FONT_FAMILY, HEADING_FONT_FAMILY } from '@/constants/fonts'
import { EDITOR_MODES } from '@/constants/editor-modes'
import { LINK_TYPES } from '@/constants/link-types'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { WIKI_LINK_FORMATS } from '@/constants/wiki-links'

export const MarkdownInput = ({
    id,
    mode = EDITOR_MODES.LIVE,
    value,
    onChangeText,
    onHistoryChange,
    action,
    onFocus,
    onBlur,
    placeholder,
    titleField,
    onTitleChange,
    onTitleBlur,
    propertiesPanel,
    onToggleProperties,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    onTagPress,
    search,
    anchor,
    onJumpToAnchor,
    headingIndex,
    jumpNonce,
    showBacklinks = true
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { tags: knownTags } = useTags()

    const fonts = useDomFonts()
    const katexFonts = useKatexFonts()

    const [linkFormat, setLinkFormat] = useState(WIKI_LINK_FORMATS.WIKILINK)

    useStorageEffect(STORAGE_KEYS.LINK_FORMAT, (value) => {
        if (value === WIKI_LINK_FORMATS.MARKDOWN) setLinkFormat(WIKI_LINK_FORMATS.MARKDOWN)
    })

    const allNoteEntries = useNoteEntries()
    const noteEntries = useMemo(() => allNoteEntries.map((entry) => (
        entry.id === id ? { ...entry, unlabeled: [] } : entry
    )), [allNoteEntries, id])
    const onCreateBlockId = useBlockIdCreator()
    const linkMention = useMentionLinker(id)
    const backlinksHtml = useBacklinksHtml(id, mode === EDITOR_MODES.READ && showBacklinks)
    const missingNote = useMissingNote()

    const valueWithWikiLinks = useResolvedWikiLinks(mode === EDITOR_MODES.READ ? value : '', id)
    const { value: previewValue, mediaMap } = useResolvedPreviewMarkdown(valueWithWikiLinks)
    const embedImageMap = useEmbedImageMap(value, mode === EDITOR_MODES.LIVE)
    const mediaMapEntries = useMemo(() => [...mediaMap, ...embedImageMap], [mediaMap, embedImageMap])

    const { setMissing } = missingNote
    const listFiles = useAttachmentFiles()
    const openFile = useOpenFile()

    const onLinkPress = useCallback((url) => {
        const link = resolveLinkPress(url)
        if (!link) return

        switch (link.type) {
            case LINK_TYPES.TAG:
                onTagPress?.(link.tag)
                break
            case LINK_TYPES.MISSING_NOTE:
                setMissing(link.missing)
                break
            case LINK_TYPES.NOTE:
                if (link.id === id && link.anchor) onJumpToAnchor(link.anchor)
                else router.push(getEditorPath(link.id, link.anchor))
                break
            case LINK_TYPES.LINK_MENTION:
                linkMention(link.path)
                break
            case LINK_TYPES.FILE:
                openFile(findFileByTarget(listFiles(), link.target))
                break
            default:
                Linking.openURL(link.url)
        }
    }, [
        id,
        onJumpToAnchor,
        onTagPress,
        setMissing,
        linkMention,
        listFiles,
        openFile
    ])

    const onImagePress = useCallback((url) => router.push({
        pathname: ROUTES.IMAGE_VIEWER,
        params: { url: encodeURIComponent(url) }
    }), [])

    const onToggleTask = useCallback((index) => {
        onChangeText(toggleTask(value, index))
    }, [value, onChangeText])

    const dom = useMemo(() => ({
        scrollEnabled: mode === EDITOR_MODES.READ,
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        androidLayerType: 'software',
        style: { flex: 1 }
    }), [mode])

    const { fontSize, maxWidth } = useEditorDisplay()

    const theme = useMemo(() => ({
        colors,
        layout: { maxWidth },
        typography: {
            fontSize,
            fontFamily: BODY_FONT_FAMILY,
            headingFontFamily: HEADING_FONT_FAMILY
        }
    }), [colors, fontSize, maxWidth])

    return (
        <>
            <MarkdownDomEditor
                mode={mode}
                value={value}
                previewValue={previewValue}
                mediaMap={mediaMapEntries}
                noteEntries={noteEntries}
                knownTags={knownTags}
                linkFormat={linkFormat}
                backlinksHtml={backlinksHtml}
                onChange={onChangeText}
                onHistoryChange={onHistoryChange}
                action={action}
                onFocus={onFocus}
                onBlur={onBlur}
                onLinkPress={onLinkPress}
                onTagPress={onTagPress}
                onCreateBlockId={onCreateBlockId}
                onImagePress={onImagePress}
                onToggleTask={onToggleTask}
                placeholder={placeholder}
                titleField={titleField}
                onTitleChange={onTitleChange}
                onTitleBlur={onTitleBlur}
                propertiesPanel={propertiesPanel}
                onToggleProperties={onToggleProperties}
                onChangeProperty={onChangeProperty}
                onRemoveTag={onRemoveTag}
                onAddTag={onAddTag}
                search={search}
                anchor={anchor}
                headingIndex={headingIndex}
                jumpNonce={jumpNonce}
                theme={theme}
                fonts={fonts}
                katexFonts={katexFonts}
                dom={dom}
            />

            <ConfirmDialog
                visible={!!missingNote.missing}
                title={t('message.wiki_links.missing_title')}
                message={t('message.wiki_links.missing_message', { title: missingNote.missing?.title })}
                confirmLabel={t('button.create')}
                onDismiss={missingNote.dismiss}
                onConfirm={missingNote.create}
            />
        </>
    )
}
