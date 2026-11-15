package com.monospace.notes.repository

import androidx.sqlite.SQLiteConnection
import androidx.sqlite.SQLiteStatement
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import androidx.sqlite.execSQL

const val INDEX_SCHEMA_VERSION = 1
const val INDEX_DATABASE_NAME = "repository-index.db"

private const val NOTE_EXTENSION_LENGTH = 3

private val SCHEMA = listOf(
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
  "CREATE VIRTUAL TABLE note_fts USING fts5(title, body, content='', contentless_delete=1, tokenize='unicode61 remove_diacritics 2')"
)

private val DROP_ORDER = listOf("note_fts", "properties", "links", "tags", "notes")

data class FileMeta(val modified: Long, val size: Long)

data class IndexedNote(
  val filename: String,
  val uri: String,
  val modified: Long,
  val size: Long,
  val parsed: ParsedNote
)

class RepositoryIndex private constructor(private val connection: SQLiteConnection) : AutoCloseable {
  companion object {
    fun open(path: String): RepositoryIndex {
      val connection = BundledSQLiteDriver().open(path)

      return try {
        RepositoryIndex(connection).also(RepositoryIndex::prepare)
      } catch (error: Throwable) {
        connection.close()
        throw error
      }
    }
  }

  private fun prepare() {
    connection.execSQL("PRAGMA journal_mode = WAL")
    connection.execSQL("PRAGMA synchronous = NORMAL")
    connection.execSQL("PRAGMA foreign_keys = ON")

    val version = queryOne("PRAGMA user_version") { it.getLong(0) } ?: 0L
    if (version == INDEX_SCHEMA_VERSION.toLong()) return

    transaction {
      DROP_ORDER.forEach { connection.execSQL("DROP TABLE IF EXISTS $it") }
      SCHEMA.forEach(connection::execSQL)
      connection.execSQL("PRAGMA user_version = $INDEX_SCHEMA_VERSION")
    }
  }

  fun metas(repositoryId: String): Map<String, FileMeta> {
    val metas = HashMap<String, FileMeta>()

    connection.prepare("SELECT filename, modified, size FROM notes WHERE repository_id = ?").use { statement ->
      statement.bindText(1, repositoryId)
      while (statement.step()) metas[statement.getText(0)] = FileMeta(statement.getLong(1), statement.getLong(2))
    }

    return metas
  }

  fun count(repositoryId: String): Int = connection.prepare("SELECT COUNT(*) FROM notes WHERE repository_id = ?").use { statement ->
    statement.bindText(1, repositoryId)
    statement.step()
    statement.getLong(0).toInt()
  }

  fun write(repositoryId: String, upserts: List<IndexedNote>, removed: List<String>) = transaction {
    WriteStatements(connection).use { statements ->
      (upserts.map { it.filename } + removed).forEach { statements.delete(repositoryId, it) }
      upserts.forEach { statements.insert(repositoryId, it) }
    }
  }

  fun deleteRepository(repositoryId: String) = transaction {
    val filenames = ArrayList<String>()

    connection.prepare("SELECT filename FROM notes WHERE repository_id = ?").use { statement ->
      statement.bindText(1, repositoryId)
      while (statement.step()) filenames.add(statement.getText(0))
    }

    WriteStatements(connection).use { statements -> filenames.forEach { statements.delete(repositoryId, it) } }
  }

  fun deleteRepositoriesExcept(keep: Set<String>) {
    val stale = ArrayList<String>()

    connection.prepare("SELECT DISTINCT repository_id FROM notes").use { statement ->
      while (statement.step()) statement.getText(0).takeIf { it !in keep }?.let(stale::add)
    }

    stale.forEach(::deleteRepository)
  }

  override fun close() = connection.close()

  private fun <T> queryOne(sql: String, read: (SQLiteStatement) -> T): T? =
    connection.prepare(sql).use { statement -> if (statement.step()) read(statement) else null }

  private fun transaction(block: () -> Unit) {
    connection.execSQL("BEGIN IMMEDIATE")

    try {
      block()
      connection.execSQL("COMMIT")
    } catch (error: Throwable) {
      connection.execSQL("ROLLBACK")
      throw error
    }
  }
}

private class WriteStatements(connection: SQLiteConnection) : AutoCloseable {
  private val findNote = connection.prepare("SELECT id FROM notes WHERE repository_id = ? AND filename = ?")
  private val deleteFts = connection.prepare("DELETE FROM note_fts WHERE rowid = ?")
  private val deleteNote = connection.prepare("DELETE FROM notes WHERE id = ?")

  private val insertNote = connection.prepare(
    "INSERT INTO notes(repository_id, filename, uri, title, modified, size, invalid_frontmatter) VALUES(?,?,?,?,?,?,?)"
  )

  private val insertTag = connection.prepare("INSERT INTO tags(note_id, position, name) VALUES(?,?,?)")
  private val insertLink = connection.prepare("INSERT INTO links(note_id, position, text) VALUES(?,?,?)")
  private val insertProperty = connection.prepare("INSERT INTO properties(note_id, position, key) VALUES(?,?,?)")
  private val insertFts = connection.prepare("INSERT INTO note_fts(rowid, title, body) VALUES(?,?,?)")
  private val lastId = connection.prepare("SELECT last_insert_rowid()")

  fun delete(repositoryId: String, filename: String) {
    findNote.bindText(1, repositoryId)
    findNote.bindText(2, filename)
    val id = if (findNote.step()) findNote.getLong(0) else null
    findNote.reset()

    if (id == null) return

    execute(deleteFts) { it.bindLong(1, id) }
    execute(deleteNote) { it.bindLong(1, id) }
  }

  fun insert(repositoryId: String, note: IndexedNote) {
    val parsed = note.parsed
    val title = note.filename.dropLast(NOTE_EXTENSION_LENGTH)

    execute(insertNote) {
      it.bindText(1, repositoryId)
      it.bindText(2, note.filename)
      it.bindText(3, note.uri)
      it.bindText(4, title)
      it.bindLong(5, note.modified)
      it.bindLong(6, note.size)
      it.bindLong(7, if (parsed.invalidFrontmatter) 1 else 0)
    }

    lastId.step()
    val id = lastId.getLong(0)
    lastId.reset()

    insertAll(insertTag, id, parsed.frontmatterTags + parsed.inlineTags)
    insertAll(insertLink, id, parsed.links)
    insertAll(insertProperty, id, parsed.propertyKeys)

    execute(insertFts) {
      it.bindLong(1, id)
      it.bindText(2, title)
      it.bindText(3, parsed.body)
    }
  }

  override fun close() {
    listOf(
      findNote, deleteFts, deleteNote, insertNote, insertTag,
      insertLink, insertProperty, insertFts, lastId
    ).forEach(SQLiteStatement::close)
  }

  private fun insertAll(statement: SQLiteStatement, noteId: Long, values: List<String>) {
    values.forEachIndexed { position, value ->
      execute(statement) {
        it.bindLong(1, noteId)
        it.bindLong(2, position.toLong())
        it.bindText(3, value)
      }
    }
  }

  private fun execute(statement: SQLiteStatement, bind: (SQLiteStatement) -> Unit) {
    bind(statement)
    statement.step()
    statement.reset()
  }
}
