import { MIME_TYPES } from '../../../../shared/constants/mime-types'

export const EXPORT_FONT_SIZE = 13

export const EXPORT_FORMATS = {
    MARKDOWN: 'markdown',
    HTML: 'html',
    PDF: 'pdf'
}

export const PRO_EXPORT_FORMATS = [EXPORT_FORMATS.HTML, EXPORT_FORMATS.PDF]

export const EXPORT_MIME_TYPES = {
    [EXPORT_FORMATS.MARKDOWN]: MIME_TYPES.MARKDOWN,
    [EXPORT_FORMATS.HTML]: MIME_TYPES.HTML,
    [EXPORT_FORMATS.PDF]: MIME_TYPES.PDF
}

export const EXPORT_EXTENSIONS = {
    [EXPORT_FORMATS.MARKDOWN]: 'md',
    [EXPORT_FORMATS.HTML]: 'html',
    [EXPORT_FORMATS.PDF]: 'pdf'
}

export const EXPORT_ALLOWED_TAGS = [
    'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt',
    'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li',
    'mark', 'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody',
    'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul'
]

export const EXPORT_ALLOWED_ATTRIBUTES = [
    'alt', 'align', 'class', 'colspan', 'height', 'href', 'open', 'rowspan', 'src', 'title', 'width'
]

export const EXPORT_URL_ATTRIBUTES = ['href', 'src']

export const EXPORT_SAFE_URL_PATTERN = /^(?:https?:|mailto:|tel:|data:image\/(?:png|gif|jpe?g|webp);|#|\/|\.)/i

export const EXPORT_LOCAL_IMAGE_URL_PATTERN = /^(?:file|content):\/\//i

const EXPORT_CONTENT_SECURITY_POLICY_DIRECTIVES = [
    "script-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    'font-src data:'
]

export const EXPORT_CONTENT_SECURITY_POLICY = EXPORT_CONTENT_SECURITY_POLICY_DIRECTIVES.join('; ')

export const EXPORT_DOCUMENT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="{policy}" />
<title>{title}</title>
<style>
    body { background: {background}; margin: 0; }
    {fonts}
    {css}
</style>
</head>
<body>
<div class="markdown-preview">{body}</div>
</body>
</html>`
