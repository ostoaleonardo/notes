package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import uniffi.engine.Engine
import uniffi.engine.NoteRecord
import uniffi.engine.ScannedRecord

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

suspend fun indexRepository(
  context: Context,
  engine: Engine,
  repositoryId: String,
  directoryUri: String,
  dispatcher: CoroutineDispatcher,
  onProgress: (done: Int, total: Int) -> Unit
): IndexStats {
  val scanStart = System.nanoTime()
  val scanned = scanNotes(context, directoryUri)
  val plan = engine.plan(repositoryId, scanned.map { ScannedRecord(it.filename, it.modified, it.size) })
  val changed = plan.changed.map { scanned[it.toInt()] }
  val scanMs = elapsedMs(scanStart)
  var readMs = 0L
  var parseMs = 0L
  var writeMs = 0L
  var unreadable = 0
  var done = 0

  if (plan.removed.isNotEmpty()) engine.remove(repositoryId, plan.removed)

  onProgress(0, changed.size)

  coroutineScope {
    val batches = Channel<Pair<List<ScannedFile>, List<String?>>>(PIPELINE_DEPTH)

    launch {
      for (batch in changed.chunked(INDEX_BATCH_SIZE)) {
        val readStart = System.nanoTime()
        val texts = readAll(context, batch.map { it.uri }, dispatcher) { it }
        readMs += elapsedMs(readStart)
        batches.send(batch to texts)
      }

      batches.close()
    }

    for ((batch, texts) in batches) {
      val notes = batch.mapIndexedNotNull { position, file ->
        texts[position]?.let { NoteRecord(file.filename, file.uri, file.modified, file.size, it) }
      }

      unreadable += batch.size - notes.size

      val report = engine.write(repositoryId, notes)
      parseMs += report.parseMs.toLong()
      writeMs += report.writeMs.toLong()

      done += batch.size
      onProgress(done, changed.size)
    }
  }

  return IndexStats(
    total = plan.unchanged.toInt() + plan.added.toInt() + plan.updated.toInt(),
    added = plan.added.toInt(),
    updated = plan.updated.toInt(),
    removed = plan.removed.size,
    unchanged = plan.unchanged.toInt(),
    unreadable = unreadable,
    scanMs = scanMs,
    readParseMs = readMs + parseMs,
    writeMs = writeMs
  )
}

private fun elapsedMs(start: Long) = (System.nanoTime() - start) / NANOS_PER_MILLI
