package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch


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
  index: RepositoryIndex,
  repositoryId: String,
  directoryUri: String,
  dispatcher: CoroutineDispatcher,
  onProgress: (done: Int, total: Int) -> Unit
): IndexStats {
  val scanStart = System.nanoTime()
  val plan = planReconcile(index.metas(repositoryId), scanNotes(context, directoryUri))
  val scanMs = elapsedMs(scanStart)
  var readParseMs = 0L
  var writeMs = 0L
  var unreadable = 0
  var done = 0

  if (plan.removed.isNotEmpty()) index.write(repositoryId, emptyList(), plan.removed)

  onProgress(0, plan.changed.size)

  coroutineScope {
    val batches = Channel<Pair<List<ScannedFile>, List<ParsedNote?>>>(PIPELINE_DEPTH)

    launch {
      for (batch in plan.changed.chunked(INDEX_BATCH_SIZE)) {
        val readStart = System.nanoTime()
        val parsed = readAll(context, batch.map { it.uri }, dispatcher, ::parseNote)
        readParseMs += elapsedMs(readStart)
        batches.send(batch to parsed)
      }

      batches.close()
    }

    for ((batch, parsed) in batches) {
      val notes = batch.mapIndexedNotNull { position, file ->
        parsed[position]?.let { IndexedNote(file.filename, file.uri, file.modified, file.size, it) }
      }

      unreadable += batch.size - notes.size

      val writeStart = System.nanoTime()
      index.write(repositoryId, notes, emptyList())
      writeMs += elapsedMs(writeStart)

      done += batch.size
      onProgress(done, plan.changed.size)
    }
  }

  return IndexStats(
    total = plan.unchanged + plan.added + plan.updated,
    added = plan.added,
    updated = plan.updated,
    removed = plan.removed.size,
    unchanged = plan.unchanged,
    unreadable = unreadable,
    scanMs = scanMs,
    readParseMs = readParseMs,
    writeMs = writeMs
  )
}

private fun elapsedMs(start: Long) = (System.nanoTime() - start) / NANOS_PER_MILLI
