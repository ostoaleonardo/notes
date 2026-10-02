'use dom'

import { useEffect, useMemo, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab, redoDepth, undoDepth } from '@codemirror/commands'
import { closeSearchPanel, openSearchPanel, search, searchKeymap, setSearchQuery, SearchQuery } from '@codemirror/search'
import { codeFolding } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { fontFacesCss } from './markdown-dom-fonts'
import { katexFontFacesCss } from './markdown-dom-katex-fonts'
import { katexCss } from './markdown-dom-katex-css'
import { TitleSection } from './markdown-dom-widgets'
import { buildEditorTheme, buildPreviewCss } from './markdown-dom-theme'
import { renderMarkdownHtml } from './markdown-dom-render-html'
import { runAction } from './markdown-dom-commands'
import { liveFormatting, mediaMapFacet } from './live-formatting/live-formatting'
import { noteEntriesFacet, wikiLinkFormatFacet, wikiLinkCompletionSource } from './wiki-link-completion'
import { useCompartment } from './use-compartment'
import { listKeymap } from './markdown-dom-list-keymap'
import { headingFoldService } from './markdown-dom-fold'
import { pasteUrlOverSelection } from './markdown-dom-paste'
import { buildInvalidFrontmatterHighlight } from './markdown-dom-invalid-frontmatter'

import { EDITOR_MODES } from '@/constants/editor-modes'

const createHiddenSearchPanel = () => {
    const dom = document.createElement('div')
    dom.style.display = 'none'
    return { dom }
}

const MarkdownDomEditor = ({
    mode,
    value,
    previewValue,
    mediaMap,
    noteEntries,
    linkFormat,
    backlinksHtml,
    onChange,
    onHistoryChange,
    action,
    onFocus,
    onBlur,
    onLinkPress,
    onImagePress,
    colors,
    typography,
    fonts,
    katexFonts,
    placeholder = '',
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
    replaceText
}) => {
    const { fontSize = 13, fontFamily, headingFontFamily } = typography

    const containerRef = useRef(null)
    const previewRef = useRef(null)
    const viewRef = useRef(null)

    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    const onHistoryChangeRef = useRef(onHistoryChange)
    onHistoryChangeRef.current = onHistoryChange

    const onFocusRef = useRef(onFocus)
    onFocusRef.current = onFocus

    const onBlurRef = useRef(onBlur)
    onBlurRef.current = onBlur

    const historyRef = useRef({ canUndo: false, canRedo: false })
    const lastEmittedValueRef = useRef(value)
    const hasFocusRef = useRef(false)

    const mediaMapValue = useMemo(() => new Map(mediaMap || []), [mediaMap])

    const mediaMapExtension = useCompartment(viewRef, () => mediaMapFacet.of(mediaMapValue), [mediaMapValue])
    const noteEntriesExtension = useCompartment(viewRef, () => noteEntriesFacet.of(noteEntries || []), [noteEntries])
    const linkFormatExtension = useCompartment(viewRef, () => wikiLinkFormatFacet.of(linkFormat), [linkFormat])
    const liveFormattingExtension = useCompartment(viewRef, () => (mode === EDITOR_MODES.LIVE ? [liveFormatting] : []), [mode])
    const invalidFrontmatterExtension = useCompartment(
        viewRef,
        () => buildInvalidFrontmatterHighlight(colors.errorContainer),
        [colors.errorContainer]
    )

    useEffect(() => {
        document.documentElement.style.height = '100%'
        document.body.style.height = '100%'
        document.body.style.margin = '0'

        const root = document.getElementById('root')
        if (root) root.style.height = '100%'

        const theme = buildEditorTheme({ fontSize, fontFamily, headingFontFamily, colors })

        const state = EditorState.create({
            doc: value || '',
            extensions: [
                history(),
                search({ createPanel: createHiddenSearchPanel }),
                keymap.of([
                    indentWithTab,
                    ...listKeymap,
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...searchKeymap
                ]),
                markdown({ extensions: GFM }),
                mediaMapExtension,
                noteEntriesExtension,
                linkFormatExtension,
                autocompletion({ override: [wikiLinkCompletionSource] }),
                closeBrackets(),
                codeFolding(),
                headingFoldService,
                pasteUrlOverSelection,
                liveFormattingExtension,
                invalidFrontmatterExtension,
                EditorView.lineWrapping,
                placeholderExtension(placeholder),
                theme,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const newValue = update.state.doc.toString()
                        lastEmittedValueRef.current = newValue
                        onChangeRef.current(newValue)
                    }

                    const canUndo = undoDepth(update.state) > 0
                    const canRedo = redoDepth(update.state) > 0

                    if (canUndo !== historyRef.current.canUndo || canRedo !== historyRef.current.canRedo) {
                        historyRef.current = { canUndo, canRedo }
                        onHistoryChangeRef.current?.(historyRef.current)
                    }
                })
            ]
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
        action.clear?.()
        requestAnimationFrame(() => view.focus())
    }, [action.action, action.payload])

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
            const link = event.target.closest('a')
            if (link) {
                event.preventDefault()
                onLinkPress?.(link.getAttribute('href'))
                return
            }

            const image = event.target.closest('img')
            if (image) onImagePress?.(image.getAttribute('src'))
        }

        container.addEventListener('click', onClick)
        return () => container.removeEventListener('click', onClick)
    }, [onLinkPress, onImagePress])

    const html = useMemo(
        () => (mode === EDITOR_MODES.READ ? renderMarkdownHtml(previewValue) + (backlinksHtml || '') : ''),
        [mode, previewValue, backlinksHtml]
    )

    const fontsReady = !!fonts && !!katexFonts

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
                display: 'flex',
                overflowX: 'hidden',
                flexDirection: 'column',
                opacity: fontsReady ? 1 : 0,
                transition: 'opacity 120ms ease'
            }}
        >
            <style>
                {fontFacesCss(fonts)}
                {katexFontFacesCss(katexFonts)}
                {katexCss}
                {previewCss}
            </style>

            <TitleSection
                {...titleField}
                onTitleChange={onTitleChange}
                onTitleBlur={onTitleBlur}
                tags={mode === EDITOR_MODES.CODE ? undefined : tags}
                propertiesLabel={propertiesLabel}
                propertiesVisible={propertiesVisible}
                onToggleProperties={onToggleProperties}
                onRemoveTag={onRemoveTag}
                onOpenTags={onOpenTags}
                invalidProperties={invalidProperties}
                invalidPropertiesTitle={invalidPropertiesTitle}
                invalidPropertiesDescription={invalidPropertiesDescription}
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
