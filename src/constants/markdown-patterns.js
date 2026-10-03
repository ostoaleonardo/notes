export const PREVIEW_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]*)\)/g
export const PREVIEW_LINK_PATTERN = /\[([^\]]*)\]\(([^)]*)\)/g
export const PREVIEW_MARKER = '⁣'

export const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(((?:file|content):\/\/[^)]+)\)/g
export const HTML_IMAGE_PATTERN = /(<img[^>]*\bsrc=["'])((?:file|content):\/\/[^"']+)(["'])/g

export const TAG_SEPARATOR_PATTERN = /[,\s]+/
export const LEADING_HASH_PATTERN = /^#/

export const URL_PATTERN = /^https?:\/\/\S+$/
export const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n*/

export const LIST_LINE_PATTERN = /^(\s*)([-*+]|\d+\.)(\s+)(\[[ xX]\]\s+)?/
export const LIST_MARKERS = {
    checklist: /^(\s*)-\s+\[[ xX]\]\s+/,
    ordered: /^(\s*)\d+\.\s+/,
    bullet: /^(\s*)[-*+]\s+/
}

export const LIST_TYPES = {
    BULLET: 'bullet',
    ORDERED: 'ordered',
    CHECKLIST: 'checklist'
}

export const WRAP_MARKERS = {
    BOLD: '*',
    ITALIC: '_',
    STRIKE: '~~',
    CODE: '`'
}
