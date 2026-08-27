'use dom'

import { useEffect, useMemo, useRef } from 'react'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import { fontFacesCss } from './markdown-dom-fonts'
import { TitleSection } from './markdown-dom-widgets'
import { buildPreviewCss } from './markdown-dom-theme'

const md = new MarkdownIt({ html: true, linkify: true })
    .use(taskLists, { enabled: true })

const MarkdownDomPreview = ({
    value,
    onLinkPress,
    onImagePress,
    textColor,
    linkColor,
    quoteBackgroundColor,
    codeBackgroundColor,
    thematicBreakColor,
    fontFamily,
    headingFontFamily,
    fonts,
    fontSize = 13,
    title,
    onTitleChange,
    titlePlaceholder,
    dateLabel
}) => {
    const containerRef = useRef(null)

    const html = useMemo(() => DOMPurify.sanitize(md.render(value || '')), [value])

    const css = useMemo(() => buildPreviewCss({
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

    useEffect(() => {
        const container = containerRef.current
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

    return (
        <div style={{ overflowX: 'hidden' }}>
            <style>
                {fontFacesCss(fonts)}
                {css}
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
                className='markdown-preview'
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}

export default MarkdownDomPreview
