import { buildPreviewCss } from '@/components/markdown/markdown-dom-theme'
import { renderMarkdownRaw } from '@/components/markdown/markdown-dom-render-html'
import { resolveEmbeds } from '@/utils/embeds'
import { replaceLocalImageUrls } from '@/utils/local-images'
import { sanitizeHtml } from '@/utils/sanitize-html'
import { escapeHtml, unwrapWikiLinks } from '@/utils/wiki-links'

import { COLORS, TRANSPARENT } from '@/constants/themes'
import { FONTS } from '@/constants/fonts'
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

export const getNoteAsHtml = (note, { imageUrls = NO_URLS, ...context } = {}) => {
    const css = buildPreviewCss({
        fontFamily: FONTS.azeretLight,
        headingFontFamily: `${FONTS.nType82Headline}, system-ui, sans-serif`,
        colors: {
            text: COLORS.light.onBackground,
            link: COLORS.base.accent,
            quoteBackground: COLORS.light.background,
            codeBackground: COLORS.light.onBackground + TRANSPARENT[10],
            thematicBreak: COLORS.base.accent + TRANSPARENT[30]
        },
        fontSize: EXPORT_FONT_SIZE
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
    ${css}
</style>
</head>
<body>
<div class="markdown-preview">${body}</div>
</body>
</html>`
}
