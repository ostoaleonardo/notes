import { fontFacesCss } from '@/features/editor/shared/markdown-dom-fonts'
import { buildPreviewCss } from '@/features/editor/shared/markdown-dom-preview-css'
import { renderMarkdownRaw } from '@/features/editor/shared/markdown-dom-render-html'
import { resolveEmbeds } from '@/features/editor/native/utils/embeds'
import { replaceLocalImageUrls } from '@/features/editor/shared/utils/local-images'
import { sanitizeHtml } from '@/features/editor/native/utils/sanitize-html'
import { escapeHtml, unwrapWikiLinks } from '@/shared/utils/wiki-links'
import { bodyOf } from '@/shared/utils/note-body-of'

import { COLORS, THEMES } from '@/shared/constants/themes'
import { FONTS } from '@/shared/constants/theme'
import { DEFAULT_HEADING_FONT } from '@/shared/constants/heading-fonts'
import { getHeadingFontFamily, toCssHeadingFamily } from '@/shared/utils/heading-font'
import { fillTemplate } from '@/shared/utils/fill-template'
import {
    EXPORT_CONTENT_SECURITY_POLICY,
    EXPORT_DOCUMENT_TEMPLATE,
    EXPORT_FONT_SIZE
} from '@/features/editor/native/constants/export'

const NO_MEDIA = () => null
const NO_URLS = new Map()

export const getExportMarkdown = (
    note,
    { notes = [], notePaths, getMediaUrl = NO_MEDIA, bodies } = {}
) => {
    const embedded = resolveEmbeds(bodyOf(note, bodies), {
        notes,
        notePaths,
        getMediaUrl,
        selfPath: note.path,
        bodies
    })

    return unwrapWikiLinks(embedded)
}

export const getNoteAsHtml = (
    note,
    {
        imageUrls = NO_URLS,
        headingFont = getHeadingFontFamily(DEFAULT_HEADING_FONT),
        fonts,
        ...context
    } = {}
) => {
    const css = buildPreviewCss({
        colors: THEMES.light.colors,
        typography: {
            fontSize: EXPORT_FONT_SIZE,
            fontFamily: FONTS.azeretLight,
            headingFontFamily: toCssHeadingFamily(headingFont)
        }
    })

    const markdown = replaceLocalImageUrls(getExportMarkdown(note, context), imageUrls)
    const body = renderMarkdownRaw(`# ${note.title}\n\n${markdown}`, { sanitizeHtml })

    return fillTemplate(EXPORT_DOCUMENT_TEMPLATE, {
        policy: EXPORT_CONTENT_SECURITY_POLICY,
        title: escapeHtml(note.title),
        background: COLORS.light.foreground,
        fonts: fontFacesCss(fonts),
        css,
        body
    })
}
