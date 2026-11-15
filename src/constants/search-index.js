import { NOTE_SORTS } from '@/constants/note-sort'

export const SEARCH_INDEX_MIN_TERM_LENGTH = 3
export const SEARCH_INDEX_UNCOVERED_RATIO = 0.2
export const SEARCH_PAGE_SIZE = 50
export const SEARCH_DATABASE_PAGE_SIZE = 500
export const SEARCH_DATABASE_MAX_PAGES = 3
export const SEARCH_INDEX_MIN_NOTES = 2000
export const SEARCH_INDEX_NORMALIZATION_FORM = 'NFC'
export const SEARCH_INDEX_ASCII_PATTERN = /^[\u0020-\u007e]*$/
export const SEARCH_INDEX_LIKE_ESCAPE_PATTERN = /[\\%_]/g
export const SEARCH_INDEX_LIKE_ESCAPE_REPLACEMENT = '\\$&'
export const SEARCH_INDEX_TAG_CHILD_SUFFIX = '/%'
export const SEARCH_INDEX_QUOTE = '"'
export const SEARCH_INDEX_ESCAPED_QUOTE = '""'
export const SEARCH_INDEX_COLUMN_SEPARATOR = ' '
export const SEARCH_INDEX_FORBIDDEN_TERM_CHARS = ['.', '/']

export const SEARCH_INDEX_FIELDS = {
    TITLE: 'title',
    FILENAME: 'filename',
    PATH: 'path',
    CONTENT: 'content'
}

export const SEARCH_INDEX_ALL_FIELDS = [
    SEARCH_INDEX_FIELDS.TITLE,
    SEARCH_INDEX_FIELDS.FILENAME,
    SEARCH_INDEX_FIELDS.PATH,
    SEARCH_INDEX_FIELDS.CONTENT
]

export const SEARCH_INDEX_COLUMNS = {
    [SEARCH_INDEX_FIELDS.TITLE]: 'title',
    [SEARCH_INDEX_FIELDS.FILENAME]: 'title',
    [SEARCH_INDEX_FIELDS.CONTENT]: 'content'
}

export const SEARCH_INDEX_KINDS = {
    FTS: 'fts',
    TAG: 'tag',
    AND: 'and',
    OR: 'or'
}

export const SEARCH_INDEX_SQL = {
    FTS_LEAF: 'SELECT rowid AS id FROM note_fts WHERE note_fts MATCH ?',
    TAG_LEAF: "SELECT note_id AS id FROM tags WHERE name = ? COLLATE NOCASE OR name LIKE ? ESCAPE '\\'",
    MATCH_AND: ' AND ',
    MATCH_OR: ' OR ',
    INTERSECT: ' INTERSECT ',
    UNION: ' UNION ',
    NOTES: 'SELECT n.repository_id AS repositoryId, n.filename AS filename FROM notes n WHERE n.id IN '
}

const SORT_KEY = { column: 'n.sort_key', field: 'sortKey' }
const MODIFIED = { column: 'n.modified', field: 'modified' }
const ID = { column: 'n.id', field: 'id' }

export const SEARCH_SORT_ORDERS = {
    [NOTE_SORTS.NAME_ASC]: [{ ...SORT_KEY, descending: false }, { ...ID, descending: false }],
    [NOTE_SORTS.NAME_DESC]: [{ ...SORT_KEY, descending: true }, { ...ID, descending: true }],
    [NOTE_SORTS.MODIFIED_DESC]: [
        { ...MODIFIED, descending: true },
        { ...SORT_KEY, descending: false },
        { ...ID, descending: false }
    ],
    [NOTE_SORTS.MODIFIED_ASC]: [
        { ...MODIFIED, descending: false },
        { ...SORT_KEY, descending: false },
        { ...ID, descending: false }
    ],
    [NOTE_SORTS.CREATED_DESC]: [
        { ...MODIFIED, descending: true },
        { ...SORT_KEY, descending: false },
        { ...ID, descending: false }
    ],
    [NOTE_SORTS.CREATED_ASC]: [
        { ...MODIFIED, descending: false },
        { ...SORT_KEY, descending: false },
        { ...ID, descending: false }
    ]
}

export const SEARCH_PAGE_SQL = {
    SELECT: 'SELECT n.id AS id, n.repository_id AS repositoryId, n.filename AS filename, n.sort_key AS sortKey, n.modified AS modified FROM notes n',
    WHERE: ' WHERE ',
    AND: ' AND ',
    ID_IN: 'n.id IN ',
    ORDER_BY: ' ORDER BY ',
    LIMIT: ' LIMIT ?',
    ASC: ' ASC',
    DESC: ' DESC',
    OR: ' OR ',
    LESS: ' < ?',
    GREATER: ' > ?',
    EQUALS: ' = ?'
}
