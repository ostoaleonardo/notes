import { SEARCH_HAS_VALUES, SEARCH_IS_VALUES, SEARCH_OPERATORS } from './search-query'

export const SEARCH_FILTER_COLUMNS = 2

export const SEARCH_FILTER_KINDS = {
    TAGS: 'tags',
    TOGGLE: 'toggle',
    VALUE: 'value',
    PROPERTY: 'property'
}

export const SEARCH_FILTER_OPTIONS = [
    {
        id: 'tag',
        kind: SEARCH_FILTER_KINDS.TAGS,
        label: 'search.filters.tag'
    },
    {
        id: 'path',
        kind: SEARCH_FILTER_KINDS.VALUE,
        label: 'search.filters.path',
        operator: SEARCH_OPERATORS.PATH
    },
    {
        id: 'file',
        kind: SEARCH_FILTER_KINDS.VALUE,
        label: 'search.filters.file',
        operator: SEARCH_OPERATORS.FILE
    },
    {
        id: 'property',
        kind: SEARCH_FILTER_KINDS.PROPERTY,
        label: 'search.filters.property'
    },
    {
        id: 'task-todo',
        kind: SEARCH_FILTER_KINDS.TOGGLE,
        label: 'search.filters.task_todo',
        operator: SEARCH_OPERATORS.TASK_TODO,
        value: ''
    },
    {
        id: 'task-done',
        kind: SEARCH_FILTER_KINDS.TOGGLE,
        label: 'search.filters.task_done',
        operator: SEARCH_OPERATORS.TASK_DONE,
        value: ''
    },
    {
        id: 'images',
        kind: SEARCH_FILTER_KINDS.TOGGLE,
        label: 'search.filters.images',
        operator: SEARCH_OPERATORS.HAS,
        value: SEARCH_HAS_VALUES.IMAGES
    },
    {
        id: 'files',
        kind: SEARCH_FILTER_KINDS.TOGGLE,
        label: 'search.filters.files',
        operator: SEARCH_OPERATORS.HAS,
        value: SEARCH_HAS_VALUES.FILES
    },
    {
        id: 'pinned',
        kind: SEARCH_FILTER_KINDS.TOGGLE,
        label: 'search.filters.pinned',
        operator: SEARCH_OPERATORS.IS,
        value: SEARCH_IS_VALUES.PINNED
    },
    {
        id: 'content',
        kind: SEARCH_FILTER_KINDS.VALUE,
        label: 'search.filters.content',
        operator: SEARCH_OPERATORS.CONTENT
    },
    {
        id: 'line',
        kind: SEARCH_FILTER_KINDS.VALUE,
        label: 'search.filters.line',
        operator: SEARCH_OPERATORS.LINE
    },
    {
        id: 'section',
        kind: SEARCH_FILTER_KINDS.VALUE,
        label: 'search.filters.section',
        operator: SEARCH_OPERATORS.SECTION
    }
]

export const SEARCH_CHIP_LABELS = {
    'has:images': 'search.filters.images',
    'has:files': 'search.filters.files',
    'is:pinned': 'search.filters.pinned',
    'task-todo:': 'search.filters.task_todo',
    'task-done:': 'search.filters.task_done'
}
