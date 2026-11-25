package com.monospace.notes.repository

import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

internal fun ModuleDefinitionBuilder.defineIndex(runtime: RepositoryRuntime) = with(runtime) {
  Constants("indexDatabaseName" to INDEX_DATABASE_NAME)

  Events(INDEX_PROGRESS_EVENT)

  AsyncFunction("indexRepository") Coroutine { folderId: String, uri: String ->
    indexLock.withLock {
      withContext(Dispatchers.IO) {
        engine().let { engine ->
          val stats = indexRepository(context, engine, folderId, uri, readDispatcher) { done, total ->
            sendEvent(
              INDEX_PROGRESS_EVENT,
              mapOf(ProgressKeys.FOLDER_ID to folderId, ProgressKeys.DONE to done, ProgressKeys.TOTAL to total)
            )
          }

          mapOf(
            StatsKeys.TOTAL to stats.total,
            StatsKeys.ADDED to stats.added,
            StatsKeys.UPDATED to stats.updated,
            StatsKeys.REMOVED to stats.removed,
            StatsKeys.UNCHANGED to stats.unchanged,
            StatsKeys.UNREADABLE to stats.unreadable,
            StatsKeys.SCAN_MS to stats.scanMs,
            StatsKeys.READ_PARSE_MS to stats.readParseMs,
            StatsKeys.WRITE_MS to stats.writeMs
          )
        }
      }
    }
  }

  AsyncFunction("listIndexedNotes") Coroutine { ->
    indexLock.withLock {
      withContext(Dispatchers.IO) { listIndexed(engine()) }
    }
  }

  AsyncFunction("queryIndex") Coroutine { sql: String, params: List<Any?> ->
    withContext(Dispatchers.IO) { runQuery(engine(), sql, params) }
  }

  AsyncFunction("findBacklinkCandidates") Coroutine { names: List<String>, markdownTarget: String ->
    withContext(Dispatchers.IO) {
      toRefs(engine().backlinkCandidates(names, markdownTarget))
    }
  }

  AsyncFunction("findMentionCandidates") Coroutine { terms: List<String> ->
    withContext(Dispatchers.IO) {
      engine().let { engine -> engine.mentionCandidates(terms)?.let(::toRefs) }
    }
  }

  AsyncFunction("listNoteMetadata") Coroutine { folderIds: List<String> ->
    withContext(Dispatchers.IO) { engine().listNotes(folderIds) }
  }

  AsyncFunction("pruneRepositoryIndex") Coroutine { keepIds: List<String> ->
    indexLock.withLock {
      withContext(Dispatchers.IO) { engine().prune(keepIds) }
    }
  }

  AsyncFunction("deleteFolderIndex") Coroutine { folderId: String ->
    indexLock.withLock {
      withContext(Dispatchers.IO) { engine().deleteFolder(folderId) }
    }
  }
}
