'use dom'

import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { Strikethrough } from '@lezer/markdown'
import { fontFacesCss } from './markdown-dom-fonts'
import { TitleSection } from './markdown-dom-widgets'
import { buildEditorTheme } from './markdown-dom-theme'
import { liveFormatting } from './markdown-dom-live-formatting'
import { runAction } from './markdown-dom-commands'

const MarkdownDomEditor = ({
    value,
    onChange,
    action,
    payload,
    onActionHandled,
    onFocus,
    onBlur,
    textColor,
    cursorColor,
    selectionColor,
    placeholderColor,
    fontFamily,
    headingFontFamily,
    fonts,
    fontSize = 13,
    placeholder = '',
    title,
    onTitleChange,
    titlePlaceholder,
    dateLabel
}) => {
    const containerRef = useRef(null)
    const viewRef = useRef(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    useEffect(() => {
        document.documentElement.style.height = '100%'
        document.body.style.height = '100%'
        document.body.style.margin = '0'

        const theme = buildEditorTheme({ fontSize, fontFamily, textColor, cursorColor, selectionColor, placeholderColor })

        const state = EditorState.create({
            doc: value || '',
            extensions: [
                history(),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                markdown({ extensions: [Strikethrough] }),
                liveFormatting,
                EditorView.lineWrapping,
                placeholderExtension(placeholder),
                theme,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) onChangeRef.current(update.state.doc.toString())
                })
            ]
        })

        const view = new EditorView({ state, parent: containerRef.current })

        const handleFocus = () => onFocus?.()
        const handleBlur = () => onBlur?.()
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
        if (value !== view.state.doc.toString()) {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: value || '' }
            })
        }
    }, [value])

    useEffect(() => {
        const view = viewRef.current
        if (!view || !action) return
        runAction(view, action, payload)
        onActionHandled?.()
        requestAnimationFrame(() => view.focus())
    }, [action, payload])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
            <style>{fontFacesCss(fonts)}</style>

            <TitleSection
                title={title}
                onTitleChange={onTitleChange}
                titlePlaceholder={titlePlaceholder}
                dateLabel={dateLabel}
                headingFontFamily={headingFontFamily}
                textColor={textColor}
            />

            <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
        </div>
    )
}

export default MarkdownDomEditor
