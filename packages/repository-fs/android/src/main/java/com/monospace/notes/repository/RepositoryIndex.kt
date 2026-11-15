package com.monospace.notes.repository

import androidx.sqlite.SQLiteConnection
import androidx.sqlite.SQLiteStatement
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import androidx.sqlite.execSQL

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
    connection.execSQL(IndexSql.JOURNAL_MODE)
    connection.execSQL(IndexSql.SYNCHRONOUS)
    connection.execSQL(IndexSql.FOREIGN_KEYS)

    val version = queryOne(IndexSql.READ_VERSION) { it.getLong(0) } ?: 0L
    if (version == INDEX_SCHEMA_VERSION.toLong()) return

    transaction {
      IndexSql.DROP_ORDER.forEach { connection.execSQL(IndexSql.DROP_TABLE + it) }
      IndexSql.SCHEMA.forEach(connection::execSQL)
      connection.execSQL(IndexSql.WRITE_VERSION)
    }
  }

  fun metas(repositoryId: String): Map<String, FileMeta> {
    val metas = HashMap<String, FileMeta>()

    connection.prepare(IndexSql.SELECT_METAS).use { statement ->
      statement.bindText(1, repositoryId)
      while (statement.step()) metas[statement.getText(0)] = FileMeta(statement.getLong(1), statement.getLong(2))
    }

    return metas
  }

  fun indexedNotes(): Map<String, List<Any>> {
    val repositories = ArrayList<String>()
    val filenames = ArrayList<String>()
    val modified = ArrayList<Long>()

    connection.prepare(IndexSql.SELECT_INDEXED).use { statement ->
      while (statement.step()) {
        repositories.add(statement.getText(0))
        filenames.add(statement.getText(1))
        modified.add(statement.getLong(2))
      }
    }

    return mapOf(
      IndexedKeys.REPOSITORY_IDS to repositories,
      IndexedKeys.FILENAMES to filenames,
      IndexedKeys.MODIFIED to modified
    )
  }

  fun write(repositoryId: String, upserts: List<IndexedNote>, removed: List<String>) = transaction {
    WriteStatements(connection).use { statements ->
      (upserts.map { it.filename } + removed).forEach { statements.delete(repositoryId, it) }
      upserts.forEach { statements.insert(repositoryId, it) }
    }
  }

  fun deleteRepository(repositoryId: String) = transaction {
    val filenames = ArrayList<String>()

    connection.prepare(IndexSql.SELECT_FILENAMES).use { statement ->
      statement.bindText(1, repositoryId)
      while (statement.step()) filenames.add(statement.getText(0))
    }

    WriteStatements(connection).use { statements -> filenames.forEach { statements.delete(repositoryId, it) } }
  }

  fun deleteRepositoriesExcept(keep: Set<String>) {
    val stale = ArrayList<String>()

    connection.prepare(IndexSql.SELECT_REPOSITORIES).use { statement ->
      while (statement.step()) statement.getText(0).takeIf { it !in keep }?.let(stale::add)
    }

    stale.forEach(::deleteRepository)
  }

  override fun close() = connection.close()

  private fun <T> queryOne(sql: String, read: (SQLiteStatement) -> T): T? =
    connection.prepare(sql).use { statement -> if (statement.step()) read(statement) else null }

  private fun transaction(block: () -> Unit) {
    connection.execSQL(IndexSql.BEGIN)

    try {
      block()
      connection.execSQL(IndexSql.COMMIT)
    } catch (error: Throwable) {
      connection.execSQL(IndexSql.ROLLBACK)
      throw error
    }
  }
}

private class WriteStatements(connection: SQLiteConnection) : AutoCloseable {
  private val findNote = connection.prepare(IndexSql.SELECT_NOTE_ID)
  private val deleteFts = connection.prepare(IndexSql.DELETE_FTS)
  private val deleteNote = connection.prepare(IndexSql.DELETE_NOTE)

  private val insertNote = connection.prepare(IndexSql.INSERT_NOTE)

  private val insertTag = connection.prepare(IndexSql.INSERT_TAG)
  private val insertLink = connection.prepare(IndexSql.INSERT_LINK)
  private val insertProperty = connection.prepare(IndexSql.INSERT_PROPERTY)
  private val insertFts = connection.prepare(IndexSql.INSERT_FTS)
  private val lastId = connection.prepare(IndexSql.SELECT_LAST_ID)

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
    val title = note.filename.dropLast(NOTE_EXTENSION.length)

    execute(insertNote) {
      it.bindText(1, repositoryId)
      it.bindText(2, note.filename)
      it.bindText(3, note.uri)
      it.bindText(4, title)
      it.bindLong(5, note.modified)
      it.bindLong(6, note.size)
      it.bindLong(7, if (parsed.invalidFrontmatter) INVALID_FRONTMATTER else VALID_FRONTMATTER)
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
      it.bindText(3, parsed.content)
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
