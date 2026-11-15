package com.monospace.notes.repository

internal object IndexSql {
  const val JOURNAL_MODE = "PRAGMA journal_mode = WAL"
  const val SYNCHRONOUS = "PRAGMA synchronous = NORMAL"
  const val FOREIGN_KEYS = "PRAGMA foreign_keys = ON"
  const val READ_VERSION = "PRAGMA user_version"
  const val WRITE_VERSION = "PRAGMA user_version = $INDEX_SCHEMA_VERSION"
  const val BEGIN = "BEGIN IMMEDIATE"
  const val COMMIT = "COMMIT"
  const val ROLLBACK = "ROLLBACK"
  const val DROP_TABLE = "DROP TABLE IF EXISTS "

  const val SELECT_METAS = "SELECT filename, modified, size FROM notes WHERE repository_id = ?"
  const val SELECT_INDEXED = "SELECT repository_id, filename, modified FROM notes"
  const val SELECT_FILENAMES = "SELECT filename FROM notes WHERE repository_id = ?"
  const val SELECT_REPOSITORIES = "SELECT DISTINCT repository_id FROM notes"
  const val SELECT_NOTE_ID = "SELECT id FROM notes WHERE repository_id = ? AND filename = ?"
  const val SELECT_LAST_ID = "SELECT last_insert_rowid()"
  const val DELETE_FTS = "DELETE FROM note_fts WHERE rowid = ?"
  const val DELETE_NOTE = "DELETE FROM notes WHERE id = ?"

  const val INSERT_NOTE =
    "INSERT INTO notes(repository_id, filename, uri, title, modified, size, invalid_frontmatter) VALUES(?,?,?,?,?,?,?)"

  const val INSERT_TAG = "INSERT INTO tags(note_id, position, name) VALUES(?,?,?)"
  const val INSERT_LINK = "INSERT INTO links(note_id, position, text) VALUES(?,?,?)"
  const val INSERT_PROPERTY = "INSERT INTO properties(note_id, position, key) VALUES(?,?,?)"
  const val INSERT_FTS = "INSERT INTO note_fts(rowid, title, content) VALUES(?,?,?)"

  val DROP_ORDER = listOf("note_fts", "properties", "links", "tags", "notes")

  val SCHEMA = listOf(
    """CREATE TABLE notes(
      id INTEGER PRIMARY KEY,
      repository_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      uri TEXT NOT NULL,
      title TEXT NOT NULL,
      modified INTEGER NOT NULL,
      size INTEGER NOT NULL,
      invalid_frontmatter INTEGER NOT NULL,
      UNIQUE(repository_id, filename)
    )""",
    "CREATE TABLE tags(note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE, position INTEGER NOT NULL, name TEXT NOT NULL)",
    "CREATE TABLE links(note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE, position INTEGER NOT NULL, text TEXT NOT NULL)",
    "CREATE TABLE properties(note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE, position INTEGER NOT NULL, key TEXT NOT NULL)",
    "CREATE INDEX tags_note ON tags(note_id)",
    "CREATE INDEX tags_name ON tags(name COLLATE NOCASE)",
    "CREATE INDEX links_note ON links(note_id)",
    "CREATE INDEX links_text ON links(text COLLATE NOCASE)",
    "CREATE INDEX properties_note ON properties(note_id)",
    "CREATE VIRTUAL TABLE note_fts USING fts5(title, content, content='', contentless_delete=1, tokenize='trigram remove_diacritics 1')"
  )
}
