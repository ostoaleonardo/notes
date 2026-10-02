import { useCallback, useMemo, useRef, useState } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
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
import { findBacklinks, buildBacklinksHtml, parseMissingWikiLinkTarget } from '@/utils/wiki-links'
import { getNotePaths, buildRepositoryPaths } from '@/utils/note-path'

import { ROUTES } from '@/constants/routes'
import { BODY_FONT_FAMILY, HEADING_FONT_FAMILY } from '@/constants/fonts'
import { EDITOR_MODES } from '@/constants/editor-modes'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { WIKI_LINK_SCHEME, WIKI_LINK_MISSING_PREFIX, WIKI_LINK_FORMATS } from '@/constants/wiki-links'

export const MarkdownInput = ({
    id,
    mode = EDITOR_MODES.LIVE,
    size = 13,
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
    tags,
    propertiesLabel,
    propertiesVisible,
    onToggleProperties,
    onRemoveTag,
    onOpenTags,
    invalidProperties,
    invalidPropertiesTitle,
    invalidPropertiesDescription,
    searchQuery,
    replaceText,
    showBacklinks = true
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { notes, saveNote } = useNotes()
    const { repositories } = useRepositories()

    const fonts = useDomFonts()
    const katexFonts = useKatexFonts()

    const [linkFormat, setLinkFormat] = useState(WIKI_LINK_FORMATS.WIKILINK)

    useStorageEffect(STORAGE_KEYS.LINK_FORMAT, (value) => {
        if (value === WIKI_LINK_FORMATS.MARKDOWN) setLinkFormat(WIKI_LINK_FORMATS.MARKDOWN)
    })

    const notePaths = useMemo(() => getNotePaths(notes, repositories), [notes, repositories])

    const noteEntriesCache = useRef({ key: '', entries: [] })

    const noteEntries = useMemo(() => {
        const entries = notes
            .filter((note) => note.title)
            .map((note) => ({ id: note.path, title: note.title, path: notePaths.get(note.path) || '' }))

        const key = JSON.stringify(entries)
        if (key !== noteEntriesCache.current.key) noteEntriesCache.current = { key, entries }

        return noteEntriesCache.current.entries
    }, [notes, notePaths])

    const [missingLink, setMissingLink] = useState(null)

    const repositoryPaths = useMemo(() => buildRepositoryPaths(repositories), [repositories])

    const backlinksHtml = useMemo(() => {
        if (mode !== EDITOR_MODES.READ || !showBacklinks) return ''

        const backlinks = findBacklinks(id, notes, notePaths)
        return buildBacklinksHtml(backlinks, t('title.backlinks'), notePaths)
    }, [mode, showBacklinks, id, notes, notePaths, t])

    const valueWithWikiLinks = useResolvedWikiLinks(mode === EDITOR_MODES.READ ? value : '')
    const { value: previewValue, mediaMap } = useResolvedPreviewMarkdown(valueWithWikiLinks)
    const mediaMapEntries = useMemo(() => [...mediaMap], [mediaMap])

    const onLinkPress = useCallback((url) => {
        if (!url) return

        if (url.startsWith(WIKI_LINK_SCHEME)) {
            const target = url.slice(WIKI_LINK_SCHEME.length)

            if (target.startsWith(WIKI_LINK_MISSING_PREFIX)) {
                setMissingLink(parseMissingWikiLinkTarget(target.slice(WIKI_LINK_MISSING_PREFIX.length)))
                return
            }

            router.push(getEditorPath(decodeURIComponent(target)))
            return
        }

        Linking.openURL(url)
    }, [])

    const onDismissMissingLink = useCallback(() => setMissingLink(null), [])

    const onCreateMissingNote = useCallback(async () => {
        const now = getDate()

        const targetRepository = repositories.find((repository) => (
            (repositoryPaths.get(repository.id) || '') === missingLink.path
        ))

        const { path } = await saveNote({
            title: missingLink.title,
            note: '',
            tags: [],
            createdAt: now,
            updatedAt: now
        }, targetRepository?.id)

        router.push(getEditorPath(path))
    }, [missingLink, repositories, repositoryPaths, saveNote])

    const onImagePress = useCallback((url) => router.push({
        pathname: ROUTES.IMAGE_VIEWER,
        params: { url: encodeURIComponent(url) }
    }), [])

    const dom = useMemo(() => ({
        scrollEnabled: mode === EDITOR_MODES.READ,
        showsVerticalScrollIndicator: false,
        showsHorizontalScrollIndicator: false,
        androidLayerType: 'software',
        style: { flex: 1 }
    }), [mode])

    const typography = useMemo(() => ({
        fontSize: size,
        fontFamily: BODY_FONT_FAMILY,
        headingFontFamily: HEADING_FONT_FAMILY
    }), [size])

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
                onFocus={onFocus}
                onBlur={onBlur}
                onLinkPress={onLinkPress}
                onImagePress={onImagePress}
                placeholder={placeholder}
                titleField={titleField}
                onTitleChange={onTitleChange}
                onTitleBlur={onTitleBlur}
                tags={tags}
                propertiesLabel={propertiesLabel}
                propertiesVisible={propertiesVisible}
                onToggleProperties={onToggleProperties}
                onRemoveTag={onRemoveTag}
                onOpenTags={onOpenTags}
                invalidProperties={invalidProperties}
                invalidPropertiesTitle={invalidPropertiesTitle}
                invalidPropertiesDescription={invalidPropertiesDescription}
                searchQuery={searchQuery}
                replaceText={replaceText}
                typography={typography}
                fonts={fonts}
                katexFonts={katexFonts}
                colors={colors}
                dom={dom}
            />

            <ConfirmDialog
                visible={!!missingLink}
                title={t('message.wiki_links.missing_title')}
                message={t('message.wiki_links.missing_message', { title: missingLink?.title })}
                confirmLabel={t('button.create')}
                onDismiss={onDismissMissingLink}
                onConfirm={onCreateMissingNote}
            />
        </>
    )
}
