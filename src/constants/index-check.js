export const INDEX_CHECK_LOG_PREFIX = '[index]'
export const INDEX_CHECK_TOUCHED_NOTES = 3
export const INDEX_CHECK_MIN_WORD_LENGTH = 6
export const INDEX_CHECK_FTS_RUNS = 5
export const INDEX_CHECK_DIFF_SAMPLES = 3
export const INDEX_CHECK_WORD_FLAGS = 'i'

export const INDEX_CHECK_SQL = {
    NOTES: 'SELECT id, filename, invalid_frontmatter AS invalid FROM notes WHERE repository_id = ?',
    TAGS: 'SELECT note_id, name AS value FROM tags ORDER BY note_id, position',
    LINKS: 'SELECT note_id, text AS value FROM links ORDER BY note_id, position',
    PROPERTIES: 'SELECT note_id, key AS value FROM properties ORDER BY note_id, position',
    SEARCH: 'SELECT rowid FROM note_fts WHERE note_fts MATCH ?',
    TOUCH: 'UPDATE notes SET modified = 0 WHERE id IN (SELECT id FROM notes WHERE repository_id = ? LIMIT ?)',
    VERSION: 'SELECT sqlite_version() AS version'
}
