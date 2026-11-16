'use dom'

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { useDOMImperativeHandle } from 'expo/dom'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { katexCss } from './markdown-dom-katex-css'
import { TitleSection } from './markdown-dom-widgets'
import { buildPreviewCss } from '../shared/markdown-dom-preview-css'
import { parseReadMarkdown, renderReadHtml } from '../shared/markdown-dom-render-html'
import { useReadContext } from './use-read-context'
import { PERF_MARK_READ_PAINTED } from '@/features/editor/shared/constants/perf-marks'
import { linksReset } from './link-resolution'
import { useCodeLanguages } from './use-code-languages'
import { runAction } from './markdown-dom-commands'
import { buildEditorExtensions, buildUpdateListener } from './markdown-dom-editor-extensions'
import { shouldApplyExternalValue } from './markdown-dom-external-value'
import { useEditorCompartments } from './use-editor-compartments'
import { useEditorFonts } from './use-editor-fonts'
import { useLatestRef } from '../shared/use-latest-ref'
import { useEditorSearch } from './use-editor-search'
import { usePdfEmbeds } from './use-pdf-embeds'
import { usePreviewClicks } from './use-preview-clicks'
import { scrollToEditorTarget, scrollToPreviewTarget } from './markdown-dom-anchor-target'

import { EDITOR_MODES } from '@/shared/constants/editor-modes'
import { TEST_IDS } from '@/shared/constants/test-ids'

const NO_META_LINES = []

export default function MarkdownDomEditor({
    ref,
    mode,
    onEdit,
    value,
    valueNonce,
    readValue,
    mediaMap,
    linkVersion,
    knownTags,
    linkFormat,
    tableLabels,
    lineNumbers,
    spellcheck,
    autocorrect,
    tabSize,
    inlineTitle,
    backlinksHtml,
    onChange,
    onHistoryChange,
    action,
    onFocus,
    onBlur,
    onReady,
    onPerfMark,
    onLinkPress,
    onTagPress,
    onCreateBlockId,
    onLoadBlocks,
    onResolveLinks,
    onResolveLinkDetails,
    onResolveMedia,
    onResolveLocalUrls,
    onLoadEmbeds,
    onSearchNotes,
    onImagePress,
    onToggleTask,
    theme,
    hasMath,
    loadFonts,
    loadKatexFonts,
    placeholder = '',
    titleField,
    onTitleChange,
    onTitleBlur,
    propertiesPanel,
    onToggleProperties,
    onChangeProperty,
    onRemoveTag,
    onAddTag,
    search,
    anchor,
    headingIndex,
    jumpNonce
}) {
    const { query: searchQuery, replace: replaceText } = search || {}
    const themeKey = JSON.stringify(theme)
    const stableTheme = useMemo(() => JSON.parse(themeKey), [themeKey])

    const { fontsReady, fontsCss } = useEditorFonts({ loadFonts, loadKatexFonts, hasMath })

    const containerRef = useRef(null)
    const previewRef = useRef(null)
    const viewRef = useRef(null)

    const onChangeRef = useLatestRef(onChange)
    const onHistoryChangeRef = useLatestRef(onHistoryChange)
    const onFocusRef = useLatestRef(onFocus)
    const onBlurRef = useLatestRef(onBlur)
    const onReadyRef = useLatestRef(onReady)
    const onTagPressRef = useLatestRef(onTagPress)
    const onLinkPressRef = useLatestRef(onLinkPress)
    const onCreateBlockIdRef = useLatestRef(onCreateBlockId)
    const onLoadBlocksRef = useLatestRef(onLoadBlocks)
    const onResolveLinksRef = useLatestRef(onResolveLinks)
    const onSearchNotesRef = useLatestRef(onSearchNotes)

    const [metaLines, setMetaLines] = useState(NO_META_LINES)
    useDOMImperativeHandle(ref, () => ({ setMetaLines }), [])

    const [addPropertyRequest, setAddPropertyRequest] = useState(0)
    const onAddProperty = useCallback(() => setAddPropertyRequest((count) => count + 1), [])
    const onAddPropertyRef = useLatestRef(onAddProperty)

    const historyRef = useRef({ canUndo: false, canRedo: false })
    const lastEmittedValueRef = useRef(value)
    const pendingEmittedRef = useRef(new Set())

    const dynamicExtensions = useEditorCompartments(viewRef, {
        mode,
        mediaMap,
        knownTags,
        linkFormat,
        tableLabels,
        lineNumbers,
        spellcheck,
        autocorrect,
        tabSize,
        placeholder,
        stableTheme,
        onAddPropertyRef
    })

    const initEditor = useEffectEvent(() => {
        document.documentElement.style.height = '100%'
        document.body.style.height = '100%'
        document.body.style.margin = '0'

        const root = document.getElementById('root')
        if (root) root.style.height = '100%'

        const state = EditorState.create({
            doc: value || '',
            extensions: buildEditorExtensions({
                dynamic: dynamicExtensions,
                onTagPressRef,
                onLinkPressRef,
                onCreateBlockIdRef,
                onLoadBlocksRef,
                onResolveLinksRef,
                onSearchNotesRef,
                updateListener: buildUpdateListener({
                    onChangeRef,
                    onHistoryChangeRef,
                    historyRef,
                    lastEmittedValueRef,
                    pendingEmittedRef
                })
            })
        })

        const view = new EditorView({ state, parent: containerRef.current })

        const handleFocus = () => {
            onFocusRef.current?.()
        }

        const handleBlur = () => {
            onBlurRef.current?.()
        }

        view.dom.addEventListener('focus', handleFocus, true)
        view.dom.addEventListener('blur', handleBlur, true)

        viewRef.current = view
        requestAnimationFrame(() => onReadyRef.current?.())

        return () => {
            view.dom.removeEventListener('focus', handleFocus, true)
            view.dom.removeEventListener('blur', handleBlur, true)
            view.destroy()
        }
    })

    useEffect(() => initEditor(), [])

    const linkVersionRef = useRef(linkVersion)

    useEffect(() => {
        if (linkVersionRef.current === linkVersion) return

        linkVersionRef.current = linkVersion
        viewRef.current?.dispatch({ effects: linksReset.of(null) })
    }, [linkVersion])

    useEffect(() => {
        const view = viewRef.current
        if (!view) return

        if (value === lastEmittedValueRef.current) {
            pendingEmittedRef.current.clear()
            return
        }

        const docValue = view.state.doc.toString()
        const shouldApply = shouldApplyExternalValue({
            value,
            docValue,
            lastEmitted: lastEmittedValueRef.current,
            pendingEmitted: pendingEmittedRef.current
        })

        if (!shouldApply) return

        const newValue = value || ''
        lastEmittedValueRef.current = value

        view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: newValue },
            selection: { anchor: Math.min(view.state.selection.main.head, newValue.length) }
        })
    }, [value, valueNonce])

    const runPendingAction = useEffectEvent(() => {
        const view = viewRef.current
        if (!view || !action.action) return
        runAction(view, action.action, action.payload)
        requestAnimationFrame(() => view.focus())
    })

    useEffect(() => {
        runPendingAction()
    }, [action.nonce])

    useEditorSearch(viewRef, searchQuery, replaceText)

    usePreviewClicks(previewRef, { onLinkPress, onImagePress, onToggleTask, onEdit })

    const isReading = mode === EDITOR_MODES.READ
    const languagesReady = useCodeLanguages(isReading ? readValue : '')
    const parsed = useMemo(
        () => (isReading && languagesReady ? parseReadMarkdown(readValue) : null),
        [isReading, languagesReady, readValue]
    )
    const readServices = useMemo(() => ({
        resolveLinks: onResolveLinkDetails,
        resolveMedia: onResolveMedia,
        resolveLocalUrls: onResolveLocalUrls,
        loadEmbeds: onLoadEmbeds
    }), [onResolveLinkDetails, onResolveMedia, onResolveLocalUrls, onLoadEmbeds])
    const readContext = useReadContext(parsed, readServices, linkVersion)
    const html = useMemo(
        () => (parsed && readContext ? renderReadHtml(parsed, readContext) + (backlinksHtml || '') : ''),
        [parsed, readContext, backlinksHtml]
    )

    usePdfEmbeds(previewRef, html)

    const onPerfMarkRef = useLatestRef(onPerfMark)

    useEffect(() => {
        if (!html || !onPerfMarkRef.current) return

        requestAnimationFrame(() => {
            requestAnimationFrame(() => onPerfMarkRef.current?.(PERF_MARK_READ_PAINTED))
        })
    }, [html, onPerfMarkRef])

    const scrollToTarget = useEffectEvent(() => {
        if ((!anchor && headingIndex == null) || !fontsReady) return

        const target = { anchor, headingIndex }

        if (mode === EDITOR_MODES.READ) scrollToPreviewTarget(previewRef.current, target)
        else if (viewRef.current) scrollToEditorTarget(viewRef.current, target)
    })

    useEffect(() => {
        scrollToTarget()
    }, [anchor, headingIndex, jumpNonce, html, fontsReady])

    const previewCss = useMemo(() => buildPreviewCss(stableTheme), [stableTheme])

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                overflowX: 'hidden',
                overflowY: 'auto',
                flexDirection: 'column',
                maxWidth: stableTheme.layout?.maxWidth,
                margin: '0 auto',
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
                metaLines={metaLines}
                showTitle={inlineTitle}
                onTitleChange={onTitleChange}
                onTitleBlur={onTitleBlur}
                propertiesPanel={mode === EDITOR_MODES.CODE ? undefined : propertiesPanel}
                onToggleProperties={onToggleProperties}
                addPropertyRequest={addPropertyRequest}
                onChangeProperty={onChangeProperty}
                onRemoveTag={onRemoveTag}
                onAddTag={onAddTag}
                onTagPress={onTagPress}
                theme={stableTheme}
            />

            <div
                ref={containerRef}
                style={{
                    flex: '1 0 auto',
                    display: mode === EDITOR_MODES.READ ? 'none' : 'flex'
                }}
            />

            <div
                id={TEST_IDS.EDITOR_PREVIEW}
                ref={previewRef}
                className='markdown-preview'
                style={{ display: mode === EDITOR_MODES.READ ? 'block' : 'none' }}
                dangerouslySetInnerHTML={{ __html: html }}
            />

            <div style={{ flexShrink: 0, height: stableTheme.layout?.bottomInset ?? 0 }} />
        </div>
    )
}
