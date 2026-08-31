'use dom'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, redoDepth, undoDepth } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'
import { fontFacesCss } from './markdown-dom-fonts'
import { katexFontFacesCss } from './markdown-dom-katex-fonts'
import { katexCss } from './markdown-dom-katex-css'
import { TitleSection } from './markdown-dom-widgets'
import { buildEditorTheme, buildPreviewCss } from './markdown-dom-theme'
import { liveFormatting, mediaMapFacet } from './live-formatting'
import { renderMarkdownHtml } from './markdown-dom-render-html'
import { runAction } from './markdown-dom-commands'

const MarkdownDomEditor = ({
    mode,
    value,
    previewValue,
    mediaMap,
    onChange,
    onHistoryChange,
    action,
    payload,
    onActionHandled,
    onFocus,
    onBlur,
    onLinkPress,
    onImagePress,
    textColor,
    cursorColor,
    selectionColor,
    placeholderColor,
    linkColor,
    quoteBackgroundColor,
    codeBackgroundColor,
    thematicBreakColor,
    fontFamily,
    headingFontFamily,
    fonts,
    katexFonts,
    fontSize = 13,
    placeholder = '',
    title,
    onTitleChange,
    titlePlaceholder,
    dateLabel
}) => {
    const containerRef = useRef(null)
    const previewRef = useRef(null)
    const viewRef = useRef(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const onHistoryChangeRef = useRef(onHistoryChange)
    onHistoryChangeRef.current = onHistoryChange
    const historyRef = useRef({ canUndo: false, canRedo: false })
    const lastEmittedValueRef = useRef(value)
    const hasFocusRef = useRef(false)
    const [liveFormattingCompartment] = useState(() => new Compartment())
    const [mediaMapCompartment] = useState(() => new Compartment())
    const mediaMapValue = useMemo(() => new Map(mediaMap || []), [mediaMap])

    useEffect(() => {
        document.documentElement.style.height = '100%'
        document.body.style.height = '100%'
        document.body.style.margin = '0'

        const theme = buildEditorTheme({
            fontSize,
            fontFamily,
            headingFontFamily,
            textColor,
            cursorColor,
            selectionColor,
            placeholderColor,
            linkColor,
            codeBackgroundColor,
            thematicBreakColor
        })

        const state = EditorState.create({
            doc: value || '',
            extensions: [
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                markdown({ extensions: GFM }),
                mediaMapCompartment.of(mediaMapFacet.of(mediaMapValue)),
                liveFormattingCompartment.of(mode === 'live' ? [liveFormatting] : []),
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
            onFocus?.()
        }
        const handleBlur = () => {
            hasFocusRef.current = false
            onBlur?.()
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
        if (!view) return
        view.dispatch({
            effects: liveFormattingCompartment.reconfigure(mode === 'live' ? [liveFormatting] : [])
        })
    }, [mode])

    useEffect(() => {
        const view = viewRef.current
        if (!view) return
        view.dispatch({
            effects: mediaMapCompartment.reconfigure(mediaMapFacet.of(mediaMapValue))
        })
    }, [mediaMapValue])

    useEffect(() => {
        const view = viewRef.current
        if (!view || !action) return
        runAction(view, action, payload)
        onActionHandled?.()
        requestAnimationFrame(() => view.focus())
    }, [action, payload])

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
        () => (mode === 'read' ? renderMarkdownHtml(previewValue) : ''),
        [mode, previewValue]
    )

    const previewCss = useMemo(() => buildPreviewCss({
        fontFamily,
        headingFontFamily,
        textColor,
        linkColor,
        quoteBackgroundColor,
        codeBackgroundColor,
        thematicBreakColor,
        fontSize
    }), [
        fontFamily,
        headingFontFamily,
        textColor,
        linkColor,
        quoteBackgroundColor,
        codeBackgroundColor,
        thematicBreakColor,
        fontSize
    ])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
            <style>
                {fontFacesCss(fonts)}
                {katexFontFacesCss(katexFonts)}
                {katexCss}
                {previewCss}
            </style>

            <TitleSection
                title={title}
                onTitleChange={onTitleChange}
                titlePlaceholder={titlePlaceholder}
                dateLabel={dateLabel}
                headingFontFamily={headingFontFamily}
                textColor={textColor}
            />

            <div
                ref={containerRef}
                style={{ flex: 1, minHeight: 0, display: mode === 'read' ? 'none' : 'flex' }}
            />

            <div
                ref={previewRef}
                className='markdown-preview'
                style={{ display: mode === 'read' ? 'block' : 'none' }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}

export default MarkdownDomEditor
