import { buildPreviewCss } from '@/components/markdown/markdown-dom-theme'
import { renderMarkdownRaw } from '@/components/markdown/markdown-dom-render-html'

import { COLORS, FONTS, TRANSPARENT } from '@/constants/themes'
import { EXPORT_FONT_SIZE } from '@/constants/export'

export const getNoteAsHtml = (note) => {
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

    const body = renderMarkdownRaw(`# ${note.title}\n\n${note.note || ''}`)

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${note.title}</title>
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
