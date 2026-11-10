export const SEARCH_OPERATORS = {
    FILE: 'file',
    PATH: 'path',
    CONTENT: 'content',
    MATCH_CASE: 'match-case',
    IGNORE_CASE: 'ignore-case',
    TAG: 'tag',
    LINE: 'line',
    BLOCK: 'block',
    SECTION: 'section',
    TASK: 'task',
    TASK_TODO: 'task-todo',
    TASK_DONE: 'task-done',
    HAS: 'has',
    IS: 'is'
}

export const SEARCH_OPERATOR_NAMES = Object.values(SEARCH_OPERATORS)

export const UNIT_OPERATORS = [
    SEARCH_OPERATORS.LINE,
    SEARCH_OPERATORS.BLOCK,
    SEARCH_OPERATORS.SECTION
]

export const TASK_OPERATORS = [
    SEARCH_OPERATORS.TASK,
    SEARCH_OPERATORS.TASK_TODO,
    SEARCH_OPERATORS.TASK_DONE
]

export const SEARCH_HAS_VALUES = {
    IMAGES: 'images',
    FILES: 'files'
}

export const SEARCH_IS_VALUES = {
    PINNED: 'pinned'
}

export const SEARCH_NODE_TYPES = {
    AND: 'and',
    OR: 'or',
    NOT: 'not',
    TEXT: 'text',
    REGEX: 'regex',
    FILTER: 'filter',
    PROPERTY: 'property',
    COMPARE: 'compare',
    NULL: 'null'
}

export const COMPARISON_OPERATORS = ['>=', '<=', '>', '<']

export const OPERATOR_PREFIX_REGEX = /^([a-z-]+):/i
export const PROPERTY_BRACKETS = { OPEN: '[', CLOSE: ']' }
export const GROUP_BRACKETS = { OPEN: '(', CLOSE: ')' }

export const TASK_STATUS_LINE_REGEX = /^\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+\[(.)\]\s/
export const BLOCK_SEPARATOR_REGEX = /\n[ \t]*\n/
export const HEADING_LINE_REGEX = /^#{1,6}\s/
export const IMAGE_REFERENCE_REGEX = /!\[[^\]]*\]\([^)]+\)|!\[\[[^\]]+\.(?:png|jpe?g|gif|webp|avif|bmp|svg|heic)(?:[|#][^\]]*)?\]\]/i
export const FILE_REFERENCE_REGEX = /!?\[\[[^\]|#]+\.(?!(?:md|png|jpe?g|gif|webp|avif|bmp|svg|heic)\b)\w+(?:[|#][^\]]*)?\]\]|\[[^\]]*\]\((?:file|content):[^)]+\)/i

export const TASK_STATUS_TODO = ' '
export const TASK_STATUSES_DONE = ['x', 'X']

export const WORD_CHARACTER_PATTERN = '[\\p{L}\\p{N}_]'

export const NEGATION_PREFIX = '-'
export const OR_KEYWORD = 'OR'
export const NULL_KEYWORD = 'null'
export const REGEX_DELIMITER = '/'
export const QUOTE_CHAR = '"'
export const ESCAPE_CHAR = '\\'
export const PROPERTY_SEPARATOR = ':'

export const REGEX_FLAGS = { INSENSITIVE: 'i', SENSITIVE: '' }

export const SNIPPET_LIMIT = 3
export const SNIPPET_EXTENDED_LIMIT = 8
export const SNIPPET_MAX_LENGTH = 140
export const SNIPPET_LEAD_LENGTH = 40
export const SNIPPET_ELLIPSIS = '…'
