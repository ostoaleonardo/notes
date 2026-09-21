import { useCallback, useMemo, useState } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import MarkdownDomEditor from './markdown-dom-editor'

import { ConfirmDialog } from '@/components/confirm-dialog'

import { useDomFonts } from '@/hooks/use-dom-fonts'
import { useKatexFonts } from '@/hooks/use-katex-fonts'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useResolvedPreviewMarkdown } from '@/hooks/use-resolved-preview-markdown'
import { useResolvedWikiLinks } from '@/hooks/use-resolved-wiki-links'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { getEditorPath } from '@/utils/editor-path'
import { getDate } from '@/utils/date'
import { findBacklinks, buildBacklinksHtml } from '@/utils/wiki-links'
import { getNotePaths } from '@/utils/note-path'

import { ROUTES } from '@/constants/routes'
import { FONTS, TRANSPARENT } from '@/constants/themes'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { WIKI_LINK_SCHEME, WIKI_LINK_MISSING_PREFIX, WIKI_LINK_FORMATS } from '@/constants/wiki-links'

export const MarkdownInput = ({
    id,
    mode = 'live',
    size = 13,
    value,
    onChangeText,
    onHistoryChange,
    action,
    payload,
    onActionHandled,
    onFocus,
    onBlur,
    placeholder,
    title,
    setTitle,
    onTitleBlur,
    titlePlaceholder,
    metaLabel,
    searchQuery,
    replaceText,
    showBacklinks = true
}) => {
    const { colors } = useTheme()
    const { background, onBackground, tertiary, surface } = colors
    const { t } = useTranslation()
    const fonts = useDomFonts()
    const katexFonts = useKatexFonts()

    const bodyFontFamily = `${FONTS.azeretLight}, ui-monospace, monospace`
    const headingFontFamily = `${FONTS.nType82Headline}, system-ui, sans-serif`

    const { notes, saveNote } = useNotes()
    const { repositories } = useRepositories()

    const [linkFormat, setLinkFormat] = useState(WIKI_LINK_FORMATS.WIKILINK)

    useStorageEffect(STORAGE_KEYS.LINK_FORMAT, (value) => {
        if (value === WIKI_LINK_FORMATS.MARKDOWN) setLinkFormat(WIKI_LINK_FORMATS.MARKDOWN)
    })

    const notePaths = useMemo(() => getNotePaths(notes, repositories), [notes, repositories])

    const noteEntries = useMemo(() => (
        notes
            .filter((note) => note.title)
            .map((note) => ({ id: note.id, title: note.title, path: notePaths.get(note.id) || '' }))
    ), [notes, notePaths])

    const [missingTitle, setMissingTitle] = useState(null)

    const backlinksHtml = useMemo(() => {
        if (mode !== 'read' || !showBacklinks) return ''

        const backlinks = findBacklinks(id, notes, notePaths)
        return buildBacklinksHtml(backlinks, t('title.backlinks'))
    }, [mode, showBacklinks, id, notes, notePaths, t])

    const valueWithWikiLinks = useResolvedWikiLinks(value)
    const { value: previewValue, mediaMap } = useResolvedPreviewMarkdown(valueWithWikiLinks)
    const mediaMapEntries = useMemo(() => [...mediaMap], [mediaMap])

    const onLinkPress = useCallback((url) => {
        if (!url) return

        if (url.startsWith(WIKI_LINK_SCHEME)) {
            const target = url.slice(WIKI_LINK_SCHEME.length)

            if (target.startsWith(WIKI_LINK_MISSING_PREFIX)) {
                setMissingTitle(decodeURIComponent(target.slice(WIKI_LINK_MISSING_PREFIX.length)))
                return
            }

            router.push(getEditorPath(target))
            return
        }

        Linking.openURL(url)
    }, [])

    const onDismissMissingLink = useCallback(() => setMissingTitle(null), [])

    const onCreateMissingNote = useCallback(() => {
        const newId = randomUUID()
        const now = getDate()

        saveNote({
            id: newId,
            title: missingTitle,
            note: '',
            tags: [],
            createdAt: now,
            updatedAt: now
        })

        router.push(getEditorPath(newId))
    }, [missingTitle, saveNote])

    const onImagePress = useCallback((url) => router.push({
        pathname: ROUTES.IMAGE_VIEWER,
        params: { url: encodeURIComponent(url) }
    }), [])

    const dom = useMemo(() => ({
        scrollEnabled: mode === 'read',
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        androidLayerType: 'software',
        style: { flex: 1 }
    }), [mode])

    const editorColors = useMemo(() => ({
        onBackground,
        tertiary,
        background,
        surface,
        selection: tertiary + TRANSPARENT[20],
        placeholder: onBackground + TRANSPARENT[40],
        codeBackground: onBackground + TRANSPARENT[10],
        thematicBreak: tertiary + TRANSPARENT[30]
    }), [background, onBackground, tertiary, surface])

    const typography = useMemo(() => ({
        fontSize: size,
        fontFamily: bodyFontFamily,
        headingFontFamily
    }), [size, bodyFontFamily, headingFontFamily])

    return (
        <>
            <MarkdownDomEditor
                mode={mode}
                value={value}
                previewValue={previewValue}
                mediaMap={mediaMapEntries}
                noteEntries={noteEntries}
                linkFormat={linkFormat}
                backlinksHtml={backlinksHtml}
                onChange={onChangeText}
                onHistoryChange={onHistoryChange}
                action={action}
                payload={payload}
                onActionHandled={onActionHandled}
                onFocus={onFocus}
                onBlur={onBlur}
                onLinkPress={onLinkPress}
                onImagePress={onImagePress}
                placeholder={placeholder}
                title={title}
                onTitleChange={setTitle}
                onTitleBlur={onTitleBlur}
                titlePlaceholder={titlePlaceholder}
                metaLabel={metaLabel}
                searchQuery={searchQuery}
                replaceText={replaceText}
                typography={typography}
                fonts={fonts}
                katexFonts={katexFonts}
                colors={editorColors}
                dom={dom}
            />
            <ConfirmDialog
                visible={!!missingTitle}
                title={t('message.wiki_links.missing_title')}
                message={t('message.wiki_links.missing_message', { title: missingTitle })}
                confirmLabel={t('button.create')}
                onDismiss={onDismissMissingLink}
                onConfirm={onCreateMissingNote}
            />
        </>
    )
}
