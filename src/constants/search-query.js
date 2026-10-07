export const TAG_QUALIFIER_REGEX = /(?<![\w-])tag:"([^"]+)"|(?<![\w-])tag:(\S+)/gi
export const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\([^)]+\)/
export const PINNED_QUALIFIER_REGEX = /(?<![\w-])is:pinned\b/i
export const IMAGE_QUALIFIER_REGEX = /(?<![\w-])has:image\b/i
export const CONTENT_QUALIFIER_REGEX = /(?<![\w-])in:content\b/i

export const QUALIFIER_TOKEN_REGEX = /^([a-z-]+):(.*)$/i
export const PROPERTY_TOKEN_REGEX = /^\[([^[\]:]+?)(?::([^[\]]*))?\]$/
export const REGEX_TOKEN_REGEX = /^\/(.+)\/$/
export const PHRASE_TOKEN_REGEX = /^"(.+)"$/
export const WRAPPED_VALUE_REGEX = /^(?:"(.*)"|\((.*)\))$/
export const DATE_VALUE_REGEX = /^(?:(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})|(>=|<=|>|<)?(\d{4}-\d{2}-\d{2}))$/
export const TASK_STATUS_LINE_REGEX = /^\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+\[(.)\]\s/

export const DATE_KEY_LENGTH = 10
export const DAY_IN_MS = 86400000
export const REGEX_FLAGS = 'i'

export const NEGATION_PREFIX = '-'
export const OR_KEYWORD = 'OR'
export const REGEX_DELIMITER = '/'
export const QUOTE_CHAR = '"'
export const OPENING_BRACKETS = ['(', '[']
export const CLOSING_BRACKETS = [')', ']']

export const PINNED_QUALIFIER = 'is:pinned'
export const IMAGE_QUALIFIER = 'has:image'
export const CONTENT_QUALIFIER = 'in:content'

export const SEARCH_OPERATORS = {
    TAG: 'tag',
    PATH: 'path',
    FILE: 'file',
    LINE: 'line',
    TASK: 'task',
    TASK_TODO: 'task-todo',
    TASK_DONE: 'task-done',
    MODIFIED: 'modified',
    CREATED: 'created',
    IS: 'is',
    HAS: 'has',
    IN: 'in'
}

export const LINE_OPERATORS = [
    SEARCH_OPERATORS.LINE,
    SEARCH_OPERATORS.TASK,
    SEARCH_OPERATORS.TASK_TODO,
    SEARCH_OPERATORS.TASK_DONE
]

export const TASK_STATUS_TODO = ' '
export const TASK_STATUSES_DONE = ['x', 'X']

export const SEARCH_QUALIFIER_VALUES = {
    PINNED: 'pinned',
    IMAGE: 'image',
    CONTENT: 'content'
}
