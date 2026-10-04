'use dom'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { closeSearchPanel, openSearchPanel, setSearchQuery, SearchQuery } from '@codemirror/search'

import { fontFacesCss } from './markdown-dom-fonts'
import { katexFontFacesCss } from './markdown-dom-katex-fonts'
import { katexCss } from './markdown-dom-katex-css'
import { TitleSection } from './markdown-dom-widgets'
import { buildEditorTheme, buildPreviewCss } from './markdown-dom-theme'
import { renderMarkdownHtml } from './markdown-dom-render-html'
import { runAction } from './markdown-dom-commands'
import { buildEditorExtensions, buildUpdateListener } from './markdown-dom-editor-extensions'
import { resolvePreviewClick } from './markdown-dom-preview-click'
import { liveFormatting, mediaMapFacet } from './live-formatting/live-formatting'
import { noteEntriesFacet, wikiLinkFormatFacet } from './wiki-link-completion'
import { knownTagsFacet } from './tag-completion'
import { useCompartment } from './use-compartment'
import { useLatestRef } from './use-latest-ref'
import { buildInvalidFrontmatterHighlight } from './markdown-dom-invalid-frontmatter'
import { buildPropertiesTrigger, frontmatterAutoClose } from './markdown-dom-frontmatter'
import { buildBlankPlaceholder } from './markdown-dom-placeholder'

import { EDITOR_MODES } from '@/constants/editor-modes'
import { DEFAULT_EDITOR_FONT_SIZE } from '@/constants/fonts'
import { PREVIEW_CLICK_TYPES } from '@/constants/preview-click'

const MarkdownDomEditor = ({
    mode,
    value,
    previewValue,
    mediaMap,
    noteEntries,
    knownTags,
    linkFormat,
    backlinksHtml,
    onChange,
    onHistoryChange,
    action,
    onFocus,
    onBlur,
    onLinkPress,
    onTagPress,
    onImagePress,
    onToggleTask,
    colors,
    typography,
    fonts,
    katexFonts,
    placeholder = '',
    titleField,
    onTitleChange,
    onTitleBlur,
    propertiesPanel,
    onToggleProperties,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    search
}) => {
    const { query: searchQuery, replace: replaceText } = search || {}
    const { fontSize = DEFAULT_EDITOR_FONT_SIZE, fontFamily, headingFontFamily } = typography

    const containerRef = useRef(null)
    const previewRef = useRef(null)
    const viewRef = useRef(null)

    const onChangeRef = useLatestRef(onChange)
    const onHistoryChangeRef = useLatestRef(onHistoryChange)
    const onFocusRef = useLatestRef(onFocus)
    const onBlurRef = useLatestRef(onBlur)
    const onTagPressRef = useLatestRef(onTagPress)

    const [addPropertyRequest, setAddPropertyRequest] = useState(0)
    const onAddProperty = useCallback(() => setAddPropertyRequest((count) => count + 1), [])
    const onAddPropertyRef = useLatestRef(onAddProperty)

    const historyRef = useRef({ canUndo: false, canRedo: false })
    const lastEmittedValueRef = useRef(value)
    const hasFocusRef = useRef(false)

    const mediaMapValue = useMemo(() => new Map(mediaMap || []), [mediaMap])

    const mediaMapExtension = useCompartment(viewRef, () => mediaMapFacet.of(mediaMapValue), [mediaMapValue])
    const noteEntriesExtension = useCompartment(viewRef, () => noteEntriesFacet.of(noteEntries || []), [noteEntries])
    const knownTagsExtension = useCompartment(viewRef, () => knownTagsFacet.of(knownTags || []), [knownTags])
    const linkFormatExtension = useCompartment(viewRef, () => wikiLinkFormatFacet.of(linkFormat), [linkFormat])
    const liveFormattingExtension = useCompartment(viewRef, () => (mode === EDITOR_MODES.LIVE ? [liveFormatting] : []), [mode])
    const invalidFrontmatterExtension = useCompartment(
        viewRef,
        () => buildInvalidFrontmatterHighlight(colors.errorContainer),
        [colors.errorContainer]
    )

    const frontmatterExtension = useCompartment(
        viewRef,
        () => (mode === EDITOR_MODES.CODE ? frontmatterAutoClose : buildPropertiesTrigger(onAddPropertyRef)),
        [mode]
    )

    const colorsKey = JSON.stringify(colors)

    const themeExtension = useCompartment(
        viewRef,
        () => buildEditorTheme({ fontSize, fontFamily, headingFontFamily, colors }),
        [fontSize, fontFamily, headingFontFamily, colorsKey]
    )
    const placeholderCompartment = useCompartment(
        viewRef,
        () => buildBlankPlaceholder(placeholder),
        [placeholder]
    )

    useEffect(() => {
        document.documentElement.style.height = '100%'
        document.body.style.height = '100%'
        document.body.style.margin = '0'

        const root = document.getElementById('root')
        if (root) root.style.height = '100%'

        const state = EditorState.create({
            doc: value || '',
            extensions: buildEditorExtensions({
                dynamic: [
                    mediaMapExtension,
                    noteEntriesExtension,
                    knownTagsExtension,
                    linkFormatExtension,
                    liveFormattingExtension,
                    invalidFrontmatterExtension,
                    frontmatterExtension,
                    placeholderCompartment,
                    themeExtension
                ],
                onTagPressRef,
                updateListener: buildUpdateListener({
                    onChangeRef,
                    onHistoryChangeRef,
                    historyRef,
                    lastEmittedValueRef
                })
            })
        })

        const view = new EditorView({ state, parent: containerRef.current })

        const handleFocus = () => {
            hasFocusRef.current = true
            onFocusRef.current?.()
        }
        const handleBlur = () => {
            hasFocusRef.current = false
            onBlurRef.current?.()
        }
        view.dom.addEventListener('focus', handleFocus, true)
        view.dom.addEventListener('blur', handleBlur, true)

        viewRef.current = view

        return () => {
            view.dom.removeEventListener('focus', handleFocus, true)
            view.dom.removeEventListener('blur', handleBlur, true)
            view.destroy()
        }
    }, [])

    useEffect(() => {
        const view = viewRef.current
        if (!view) return
        if (hasFocusRef.current) return
        if (value === lastEmittedValueRef.current) return
        if (value !== view.state.doc.toString()) {
            lastEmittedValueRef.current = value
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: value || '' }
            })
        }
    }, [value])

    useEffect(() => {
        const view = viewRef.current
        if (!view || !action.action) return
        runAction(view, action.action, action.payload)
        requestAnimationFrame(() => view.focus())
    }, [action.nonce])

    useEffect(() => {
        const view = viewRef.current
        if (!view) return

        if (searchQuery) {
            openSearchPanel(view)
        } else {
            closeSearchPanel(view)
        }

        view.dispatch({
            effects: setSearchQuery.of(new SearchQuery({ search: searchQuery || '', replace: replaceText || '' }))
        })
    }, [searchQuery, replaceText])

    useEffect(() => {
        const container = previewRef.current
        if (!container) return

        const onClick = (event) => {
            const click = resolvePreviewClick(event.target, container)
            if (!click) return

            switch (click.type) {
                case PREVIEW_CLICK_TYPES.LINK:
                    event.preventDefault()
                    onLinkPress?.(click.url)
                    break
                case PREVIEW_CLICK_TYPES.IMAGE:
                    onImagePress?.(click.url)
                    break
                case PREVIEW_CLICK_TYPES.TASK:
                    onToggleTask?.(click.index)
                    break
                default:
                    event.preventDefault()
            }
        }

        container.addEventListener('click', onClick)
        return () => container.removeEventListener('click', onClick)
    }, [onLinkPress, onImagePress, onToggleTask])

    const html = useMemo(
        () => (mode === EDITOR_MODES.READ ? renderMarkdownHtml(previewValue) + (backlinksHtml || '') : ''),
        [mode, previewValue, backlinksHtml]
    )

    const fontsReady = !!fonts && !!katexFonts

    const fontsCss = useMemo(() => (
        fontFacesCss(fonts) + katexFontFacesCss(katexFonts)
    ), [fonts, katexFonts])

    const previewCss = useMemo(() => buildPreviewCss({
        fontFamily,
        headingFontFamily,
        colors,
        fontSize
    }), [fontFamily, headingFontFamily, colors, fontSize])

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                overflowX: 'hidden',
                flexDirection: 'column',
                opacity: fontsReady ? 1 : 0,
                transition: 'opacity 120ms ease'
            }}
        >
            <style>
                {fontsCss}
                {katexCss}
                {previewCss}
            </style>

            <TitleSection
                {...titleField}
                onTitleChange={onTitleChange}
                onTitleBlur={onTitleBlur}
                propertiesPanel={mode === EDITOR_MODES.CODE ? undefined : propertiesPanel}
                onToggleProperties={onToggleProperties}
                addPropertyRequest={addPropertyRequest}
                onChangeProperty={onChangeProperty}
                onRemoveTag={onRemoveTag}
                onAddTag={onAddTag}
                onTagPress={onTagPress}
                colors={colors}
                typography={{ fontFamily, headingFontFamily }}
            />

            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: mode === EDITOR_MODES.READ ? 'none' : 'flex'
                }}
            />

            <div
                ref={previewRef}
                className='markdown-preview'
                style={{ display: mode === EDITOR_MODES.READ ? 'block' : 'none' }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}

export default MarkdownDomEditor
