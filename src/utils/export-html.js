import { fontFacesCss } from '@/components/markdown/markdown-dom-fonts'
import { buildPreviewCss } from '@/components/markdown/markdown-dom-preview-css'
import { renderMarkdownRaw } from '@/components/markdown/markdown-dom-render-html'
import { resolveEmbeds } from '@/utils/embeds'
import { replaceLocalImageUrls } from '@/utils/local-images'
import { sanitizeHtml } from '@/utils/sanitize-html'
import { escapeHtml, unwrapWikiLinks } from '@/utils/wiki-links'

import { COLORS, THEMES } from '@/constants/themes'
import { FONTS } from '@/constants/theme'
import { DEFAULT_HEADING_FONT } from '@/constants/heading-fonts'
import { getHeadingFontFamily, toCssHeadingFamily } from '@/utils/heading-font'
import { EXPORT_FONT_SIZE, EXPORT_CONTENT_SECURITY_POLICY } from '@/constants/export'

const NO_IMAGES = () => null
const NO_URLS = new Map()

export const getExportMarkdown = (note, { notes = [], notePaths, getImageUrl = NO_IMAGES } = {}) => {
    const embedded = resolveEmbeds(note.note || '', {
        notes,
        notePaths,
        getImageUrl,
        selfPath: note.path
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

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="${EXPORT_CONTENT_SECURITY_POLICY}" />
<title>${escapeHtml(note.title)}</title>
<style>
    body { background: ${COLORS.light.foreground}; margin: 0; }
    ${fontFacesCss(fonts)}
    ${css}
</style>
</head>
<body>
<div class="markdown-preview">${body}</div>
</body>
</html>`
}
