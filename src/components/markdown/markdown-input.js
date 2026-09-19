import { useCallback, useMemo } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import MarkdownDomEditor from './markdown-dom-editor'

import { useDomFonts } from '@/hooks/use-dom-fonts'
import { useKatexFonts } from '@/hooks/use-katex-fonts'
import { useNotes } from '@/hooks/use-notes'
import { useResolvedPreviewMarkdown } from '@/hooks/use-resolved-preview-markdown'
import { useResolvedWikiLinks } from '@/hooks/use-resolved-wiki-links'

import { FONTS, TRANSPARENT } from '@/constants/themes'
import { ROUTES } from '@/constants/routes'
import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'
import { getEditorPath } from '@/utils/editor-path'
import { findBacklinks, buildBacklinksHtml } from '@/utils/wiki-links'

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
    titlePlaceholder,
    metaLabel,
    searchQuery,
    replaceText
}) => {
    const { colors } = useTheme()
    const { background, onBackground, tertiary, surface } = colors
    const { t } = useTranslation()
    const fonts = useDomFonts()
    const katexFonts = useKatexFonts()

    const bodyFontFamily = `${FONTS.azeretLight}, ui-monospace, monospace`
    const headingFontFamily = `${FONTS.nType82Headline}, system-ui, sans-serif`

    const { notes } = useNotes()
    const noteTitles = useMemo(() => notes.map((note) => note.title).filter(Boolean), [notes])

    const backlinksHtml = useMemo(() => {
        const backlinks = findBacklinks(title, notes, id)
        return buildBacklinksHtml(backlinks, t('title.backlinks'))
    }, [title, notes, id, t])

    const valueWithWikiLinks = useResolvedWikiLinks(value)
    const { value: previewValue, mediaMap } = useResolvedPreviewMarkdown(valueWithWikiLinks)
    const mediaMapEntries = useMemo(() => [...mediaMap], [mediaMap])

    const onLinkPress = useCallback((url) => {
        if (!url) return

        if (url.startsWith(WIKI_LINK_SCHEME)) {
            router.push(getEditorPath(url.slice(WIKI_LINK_SCHEME.length)))
            return
        }

        Linking.openURL(url)
    }, [])

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
        <MarkdownDomEditor
            mode={mode}
            value={value}
            previewValue={previewValue}
            mediaMap={mediaMapEntries}
            noteTitles={noteTitles}
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
    )
}
