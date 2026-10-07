import { MIME_TYPES } from './mime-types'

export const EXPORT_FONT_SIZE = 13

export const EXPORT_FORMATS = {
    MARKDOWN: 'markdown',
    HTML: 'html',
    PDF: 'pdf'
}

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
    "form-action 'none'"
]

export const EXPORT_CONTENT_SECURITY_POLICY = EXPORT_CONTENT_SECURITY_POLICY_DIRECTIVES.join('; ')
