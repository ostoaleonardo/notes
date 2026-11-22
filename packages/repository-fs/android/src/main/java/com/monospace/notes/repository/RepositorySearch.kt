package com.monospace.notes.repository

import android.content.Context
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.runBlocking
import uniffi.engine.Engine
import uniffi.engine.EngineException
import uniffi.engine.FolderPathRecord
import uniffi.engine.NoteSource
import uniffi.engine.SearchHandle
import uniffi.engine.SearchRequestRecord
import uniffi.engine.SourceFile

internal class LocationNoteSource(
  private val context: Context,
  private val dispatcher: CoroutineDispatcher
) : NoteSource {
  override fun scan(): List<SourceFile> = emptyList()

  override fun read(locations: List<String>): List<String?> =
    runBlocking { readAll(context, locations, dispatcher) { it } }
}

internal class SearchRegistry {
  private val handles = java.util.concurrent.ConcurrentHashMap<Int, SearchHandle>()
  private val warming = java.util.concurrent.atomic.AtomicBoolean(false)
  private val counter = java.util.concurrent.atomic.AtomicInteger(FIRST_SEARCH_ID)

  fun open(
    context: Context,
    engine: Engine,
    dispatcher: CoroutineDispatcher,
    request: SearchRequestRecord
  ): Int? {
    val handle = try {
      engine.search(request, LocationNoteSource(context, dispatcher))
    } catch (error: EngineException.InvalidQuery) {
      return null
    }

    return counter.getAndIncrement().also { handles[it] = handle }
  }

  fun step(id: Int, size: Int): Map<String, Any?> {
    val step = handles[id]?.step(size.toUInt())

    return mapOf(
      SearchKeys.FOLDER_IDS to (step?.folderIds ?: emptyList()),
      SearchKeys.FILENAMES to (step?.filenames ?: emptyList()),
      SearchKeys.DONE to (step?.done ?: true)
    )
  }

  fun close(id: Int) {
    handles.remove(id)?.cancel()
  }

  fun warm(
    context: Context,
    engine: Engine,
    dispatcher: CoroutineDispatcher,
    folderIds: List<String>
  ) {
    if (!warming.compareAndSet(false, true)) return

    try {
      val warmup = engine.warm(folderIds, LocationNoteSource(context, dispatcher))

      while (!warmup.step(WARM_STEP_SIZE.toUInt())) {
        continue
      }
    } finally {
      warming.set(false)
    }
  }
}

internal fun searchRequest(
  queryJson: String,
  sort: String,
  folderIds: List<String>,
  pathFolderIds: List<String>,
  pathValues: List<String>,
  pinned: List<String>,
  matchCase: Boolean
) = SearchRequestRecord(
  queryJson,
  sort,
  folderIds,
  pathFolderIds.zip(pathValues).map { (folderId, path) -> FolderPathRecord(folderId, path) },
  pinned,
  matchCase
)

internal object SearchKeys {
  const val FOLDER_IDS = "folderIds"
  const val FILENAMES = "filenames"
  const val DONE = "done"
}

internal const val FIRST_SEARCH_ID = 1
internal const val WARM_STEP_SIZE = 200
