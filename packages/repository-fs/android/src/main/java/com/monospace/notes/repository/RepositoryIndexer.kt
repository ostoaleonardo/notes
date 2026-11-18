package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.runBlocking
import uniffi.engine.Engine
import uniffi.engine.NoteSource
import uniffi.engine.ProgressListener
import uniffi.engine.SourceRecord

data class ScannedFile(val uri: String, val filename: String, val modified: Long, val size: Long)

data class IndexStats(
  val total: Int,
  val added: Int,
  val updated: Int,
  val removed: Int,
  val unchanged: Int,
  val unreadable: Int,
  val scanMs: Long,
  val readParseMs: Long,
  val writeMs: Long
)

fun scanNotes(context: Context, directoryUri: String): List<ScannedFile> =
  listDirectory(context, Uri.parse(directoryUri)).mapNotNull { entry ->
    val name = entry[EntryKeys.NAME] as String

    if (entry[EntryKeys.IS_DIRECTORY] == true || !name.endsWith(NOTE_EXTENSION, ignoreCase = true) || name.startsWith(HIDDEN_PREFIX)) {
      return@mapNotNull null
    }

    ScannedFile(
      uri = entry[EntryKeys.URI] as String,
      filename = name,
      modified = (entry[EntryKeys.LAST_MODIFIED] as Double?)?.toLong() ?: 0L,
      size = (entry[EntryKeys.SIZE] as Double?)?.toLong() ?: 0L
    )
  }

private class ProviderNoteSource(
  private val context: Context,
  private val directoryUri: String,
  private val dispatcher: CoroutineDispatcher
) : NoteSource {
  override fun scan(): List<SourceRecord> =
    scanNotes(context, directoryUri).map { SourceRecord(it.uri, it.filename, it.modified, it.size) }

  override fun read(uris: List<String>): List<String?> =
    runBlocking { readAll(context, uris, dispatcher) { it } }
}

private class ProgressBridge(private val onProgress: (done: Int, total: Int) -> Unit) : ProgressListener {
  override fun onProgress(done: UInt, total: UInt) = onProgress(done.toInt(), total.toInt())
}

fun indexRepository(
  context: Context,
  engine: Engine,
  repositoryId: String,
  directoryUri: String,
  dispatcher: CoroutineDispatcher,
  onProgress: (done: Int, total: Int) -> Unit
): IndexStats {
  val listener = ProgressBridge(onProgress)
  val direct = directNotesTarget(context, Uri.parse(directoryUri))

  val report = if (direct != null) {
    engine.syncDirectory(repositoryId, direct.path, direct.uriPrefix, listener)
  } else {
    engine.sync(repositoryId, ProviderNoteSource(context, directoryUri, dispatcher), listener)
  }

  return IndexStats(
    total = report.total.toInt(),
    added = report.added.toInt(),
    updated = report.updated.toInt(),
    removed = report.removed.toInt(),
    unchanged = report.unchanged.toInt(),
    unreadable = report.unreadable.toInt(),
    scanMs = report.scanMs.toLong(),
    readParseMs = (report.readMs + report.parseMs).toLong(),
    writeMs = report.writeMs.toLong()
  )
}
