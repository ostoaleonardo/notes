package com.monospace.notes.repository

import android.net.Uri
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import uniffi.engine.MoveRequestRecord
import uniffi.engine.RenameRequestRecord
import uniffi.engine.SaveRequest

internal fun ModuleDefinitionBuilder.defineNotes(runtime: RepositoryRuntime) = with(runtime) {
  AsyncFunction("saveNote") Coroutine { folderId: String, directoryUri: String, filename: String, text: String, expectedModified: Double? ->
    withContext(Dispatchers.IO) {
      engine().let { engine ->
        saveReportToMap(engine.saveNote(folderId, noteSinkFor(context, directoryUri), filename, text, expectedModified?.toLong()))
      }
    }
  }

  AsyncFunction("saveNotes") Coroutine { folderId: String, directoryUri: String, filenames: List<String>, texts: List<String>, expectedModified: List<Double?> ->
    withContext(Dispatchers.IO) {
      val requests = filenames.indices.map { SaveRequest(filenames[it], texts[it], expectedModified[it]?.toLong()) }

      engine().saveNotes(folderId, noteSinkFor(context, directoryUri), requests).map(::saveReportToMap)
    }
  }

  AsyncFunction("renameNote") Coroutine { folderId: String, directoryUri: String, from: String, to: String, text: String, rootUri: String, fromKey: String, toKey: String ->
    withContext(Dispatchers.IO) {
      engine().let { engine ->
        val sink = noteSinkFor(context, directoryUri)

        saveReportToMap(engine.renameNote(folderId, sink, RenameRequestRecord(from, to, text, fromKey, toKey), versionsFor(rootUri)))
      }
    }
  }

  AsyncFunction("deleteNote") Coroutine { folderId: String, directoryUri: String, filename: String ->
    withContext(Dispatchers.IO) {
      engine().deleteNote(folderId, noteSinkFor(context, directoryUri), filename)
    }
  }

  AsyncFunction("renameFolder") Coroutine { rootUri: String, path: String, newName: String, folderIds: List<String>, parentUri: String ->
    indexLock.withLock {
      withContext(Dispatchers.IO) {
        val newPath = engine().renameFolder(repositoryFor(context, rootUri), versionsFor(rootUri), path, newName, folderIds)
        val renamed = findChild(context, Uri.parse(parentUri.trimEnd('/')), newName)

        mapOf(RenamedKeys.PATH to newPath, RenamedKeys.URI to renamed?.get(EntryKeys.URI))
      }
    }
  }

  AsyncFunction("removeFolder") Coroutine { rootUri: String, path: String, folderIds: List<String>, dropVersions: Boolean ->
    indexLock.withLock {
      withContext(Dispatchers.IO) {
        engine().removeFolder(repositoryFor(context, rootUri), versionsFor(rootUri), path, folderIds, dropVersions)
      }
    }
  }

  AsyncFunction("trashNote") Coroutine { rootUri: String, folderId: String, folderPath: String, filename: String, trashPath: String ->
    indexLock.withLock {
      withContext(Dispatchers.IO) {
        engine().trashNote(repositoryFor(context, rootUri), versionsFor(rootUri), folderId, folderPath, filename, trashPath)
      }
    }
  }

  AsyncFunction("moveNote") Coroutine { rootUri: String, filename: String, fromFolderId: String, fromPath: String, toFolderId: String, toPath: String, destinationUri: String ->
    indexLock.withLock {
      withContext(Dispatchers.IO) {
        moveReportToMap(
          engine().moveNote(
            repositoryFor(context, rootUri),
            versionsFor(rootUri),
            MoveRequestRecord(filename, fromFolderId, fromPath, toFolderId, toPath),
            noteSinkFor(context, destinationUri)
          )
        )
      }
    }
  }
}
