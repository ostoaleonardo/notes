export const SEARCH_INDEX_MIN_TERM_LENGTH = 3
export const SEARCH_INDEX_CANDIDATE_RATIO = 0.1
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
