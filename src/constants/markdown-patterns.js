export const PREVIEW_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]*)\)/g
export const PREVIEW_LINK_PATTERN = /\[([^\]]*)\]\(([^)]*)\)/g
export const PREVIEW_MARKER = '⁣'

export const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(((?:file|content):\/\/[^)]+)\)/g
export const HTML_IMAGE_PATTERN = /(<img[^>]*\bsrc=["'])((?:file|content):\/\/[^"']+)(["'])/g

export const TAG_SEPARATOR_PATTERN = /[,\s]+/
export const LEADING_HASH_PATTERN = /^#/
export const INLINE_TAG_PATTERN = /(^|\s)#([^\s!-,.:-@[-^`{-~]+)/g
export const WHITESPACE_RUN_PATTERN = /\s+/g
export const INVALID_TAG_CHAR_PATTERN = /[!-,.:-@[-^`{-~]/g
export const TAG_TYPING_PATTERN = /#[^\s!-,.:-@[-^`{-~]*/
export const TRAILING_SLASHES_PATTERN = /\/+$/
export const NON_NUMERIC_PATTERN = /\D/
export const FENCED_CODE_PATTERN = /(```|~~~)[\s\S]*?(\1|$)/g
export const INLINE_CODE_PATTERN = /`[^`\n]*`/g

export const URL_PATTERN = /^https?:\/\/\S+$/
export const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n+|$)/

export const LIST_LINE_PATTERN = /^(\s*)([-*+]|\d+\.)(\s+)(\[[^\]\n]\]\s+)?/
export const LIST_MARKERS = {
    checklist: /^(\s*)-\s+\[[^\]\n]\]\s+/,
    ordered: /^(\s*)\d+\.\s+/,
    bullet: /^(\s*)[-*+]\s+/
}

export const LIST_TYPES = {
    BULLET: 'bullet',
    ORDERED: 'ordered',
    CHECKLIST: 'checklist'
}

export const LIST_INDENT = '    '

export const WRAP_MARKERS = {
    BOLD: '**',
    ITALIC: '_',
    STRIKE: '~~',
    CODE: '`'
}

export const AUTO_PAIR_CHARS = ['*', '_', '~', '=', '`']
export const AUTO_PAIR_EXPAND_CHARS = ['*', '_', '~', '=']
export const AUTO_PAIR_WORD_PATTERN = /[\p{L}\p{N}]/u
export const AUTO_PAIR_CLOSER_PATTERN = /[\s)\]}.,;:!?]/
export const AUTO_PAIR_ACTIONS = {
    WRAP: 'wrap',
    EXPAND: 'expand',
    SKIP: 'skip',
    PAIR: 'pair'
}

export const WHITESPACE_PATTERN = /\s/
export const NON_WHITESPACE_PATTERN = /\S/
export const NON_WORD_PATTERN = /\W/
export const NEWLINE_PATTERN = /\n/g
export const LEADING_WHITESPACE_PATTERN = /^\s*/
export const REGEXP_SPECIAL_CHARS_PATTERN = /[.*+?^${}()|[\]\\]/g
export const ORDERED_MARKER_PATTERN = /^\d+\.$/
export const MARKDOWN_FILE_NAME_PATTERN = /^(.+)\.(md|markdown)$/i
export const TEMPLATE_FILE_EXTENSION_PATTERN = /\.(md|markdown|txt)$/i
export const TABLE_LEADING_PIPE_PATTERN = /^\|/
export const TABLE_TRAILING_PIPE_PATTERN = /(?<!\\)\|$/
export const TABLE_UNESCAPED_PIPE_PATTERN = /(?<!\\)\|/g
export const CHECKED_TASK_PATTERN = /\[[xX]\]/
