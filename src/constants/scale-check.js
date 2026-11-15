import { NOTE_SORTS } from '@/constants/note-sort'

export const SCALE_CHECK_LOG_PREFIX = '[scale]'
export const SCALE_CHECK_FOLDER_URI = 'content://com.android.externalstorage.documents/tree/primary%3ADocuments%2Fstress-20k'
export const SCALE_CHECK_REPOSITORY_ID = 'scale-check'
export const SCALE_CHECK_READ_BATCH = 500
export const SCALE_CHECK_RUNS = 3
export const SCALE_CHECK_TAG = 'tag7'

export const SCALE_CHECK_SORT = NOTE_SORTS.NAME_ASC

export const SCALE_CHECK_SEARCHES = [
    'a',
    'topic 12',
    'note 19999',
    'note 1999',
    'topic 12 note 777',
    'topic 55 -tag3',
    'tag:tag7',
    'tag:tag7 note 1999'
]

export const SCALE_CHECK_FTS_QUERIES = ['"topic 12"', '"note 19999"', '"topic 55"']

export const SCALE_CHECK_SQL = {
    TAGS: 'SELECT name, COUNT(*) AS total FROM tags GROUP BY name ORDER BY name',
    TAG_NOTES: 'SELECT note_id FROM tags WHERE name = ?',
    SEARCH: 'SELECT rowid FROM note_fts WHERE note_fts MATCH ?',
    EDGES: `SELECT l.note_id AS source, t.id AS target FROM links l
        JOIN notes n ON n.id = l.note_id
        JOIN notes t ON t.repository_id = n.repository_id AND t.title = l.text COLLATE NOCASE
        WHERE n.repository_id = ?`
}
