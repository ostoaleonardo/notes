'use dom'

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

import { katexCss } from './markdown-dom-katex-css'
import { TitleSection } from './markdown-dom-widgets'
import { buildPreviewCss } from './markdown-dom-preview-css'
import { renderReadHtml } from './markdown-dom-render-html'
import { runAction } from './markdown-dom-commands'
import { buildEditorExtensions, buildUpdateListener } from './markdown-dom-editor-extensions'
import { shouldApplyExternalValue } from './markdown-dom-external-value'
import { useEditorCompartments } from './use-editor-compartments'
import { useEditorFonts } from './use-editor-fonts'
import { useLatestRef } from './use-latest-ref'
import { useEditorSearch } from './use-editor-search'
import { usePdfEmbeds } from './use-pdf-embeds'
import { usePreviewClicks } from './use-preview-clicks'
import { scrollToEditorTarget, scrollToPreviewTarget } from './markdown-dom-anchor-target'

import { EDITOR_MODES } from '@/constants/editor-modes'

const MarkdownDomEditor = ({
    mode,
    onEdit,
    value,
    valueNonce,
    previewValue,
    mediaMap,
    noteEntries,
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
    onLinkPress,
    onTagPress,
    onCreateBlockId,
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
}) => {
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

    const [addPropertyRequest, setAddPropertyRequest] = useState(0)
    const onAddProperty = useCallback(() => setAddPropertyRequest((count) => count + 1), [])
    const onAddPropertyRef = useLatestRef(onAddProperty)

    const historyRef = useRef({ canUndo: false, canRedo: false })
    const lastEmittedValueRef = useRef(value)
    const pendingEmittedRef = useRef(new Set())

    const dynamicExtensions = useEditorCompartments(viewRef, {
        mode,
        mediaMap,
        noteEntries,
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
    const html = useMemo(
        () => (mode === EDITOR_MODES.READ ? renderReadHtml(previewValue) + (backlinksHtml || '') : ''),
        [mode, previewValue, backlinksHtml]
    )

    usePdfEmbeds(previewRef, html)

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
                ref={previewRef}
                className='markdown-preview'
                style={{ display: mode === EDITOR_MODES.READ ? 'block' : 'none' }}
                dangerouslySetInnerHTML={{ __html: html }}
            />

            <div style={{ flexShrink: 0, height: stableTheme.layout?.bottomInset ?? 0 }} />
        </div>
    )
}

export default MarkdownDomEditor
