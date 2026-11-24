package com.monospace.notes.repository

import android.content.ContentProviderClient
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.PermissionInfo
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.ParcelFileDescriptor
import android.provider.DocumentsContract
import android.provider.DocumentsContract.Document
import android.provider.Settings
import androidx.annotation.RequiresApi
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import uniffi.engine.Engine
import uniffi.engine.LinkNoteRecord
import uniffi.engine.VersionsHandle
import uniffi.engine.NoteFieldsRecord
import uniffi.engine.findBacklinkPaths
import uniffi.engine.renameLinksInBodies
import uniffi.engine.SaveRequest
import uniffi.engine.composeNote
import uniffi.engine.decomposeNote
import uniffi.engine.sanitizeFilename
import uniffi.engine.uniqueFilename
import java.nio.file.Files
import java.nio.file.attribute.BasicFileAttributes
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

class RepositoryFsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val readDispatcher = Dispatchers.IO.limitedParallelism(READ_PARALLELISM)
  private val indexLock = Mutex()
  private val engineLock = Any()
  private var sharedEngine: Engine? = null

  private val versionStores = java.util.concurrent.ConcurrentHashMap<String, VersionsHandle>()
  private val searches = SearchRegistry()

  private fun versionsFor(rootUri: String): VersionsHandle =
    versionStores.getOrPut("$rootUri#${hasDirectAccess()}") { VersionsHandle(repositoryFor(context, rootUri)) }

  private fun engine(): Engine = synchronized(engineLock) {
    sharedEngine ?: openEngine(context).also { sharedEngine = it }
  }

  override fun definition() = ModuleDefinition {
    Name("RepositoryFs")

    Function("hasDirectAccess") { hasDirectAccess() }

    Function("requestDirectAccess") {
      val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, Uri.parse("package:${context.packageName}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

      context.startActivity(intent)
    }

    Function("revokePermissions") {
      revokePermissions(context)
    }

    AsyncFunction("listAttachments") Coroutine { uri: String ->
      withContext(Dispatchers.IO) {
        val found = mutableListOf<Triple<String, String, String>>()
        walkAttachments(context, Uri.parse(uri), "", found)

        mapOf(
          ColumnKeys.URIS to found.map { it.first },
          ColumnKeys.NAMES to found.map { it.second },
          ColumnKeys.FOLDERS to found.map { it.third }
        )
      }
    }

    Function("findChild") { uri: String, name: String ->
      findChild(context, Uri.parse(uri), name)
    }

    Function("listDirectorySync") { uri: String ->
      listDirectory(context, Uri.parse(uri))
    }

    AsyncFunction("listDirectory") Coroutine { uri: String ->
      withContext(Dispatchers.IO) { toColumns(listDirectory(context, Uri.parse(uri))) }
    }

    AsyncFunction("readTextFiles") Coroutine { uris: List<String> ->
      readAll(context, uris, readDispatcher) { it }
    }

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

          saveReportToMap(engine.renameNote(folderId, sink, from, to, text, versionsFor(rootUri), fromKey, toKey))
        }
      }
    }

    AsyncFunction("deleteNote") Coroutine { folderId: String, directoryUri: String, filename: String ->
      withContext(Dispatchers.IO) {
        engine().deleteNote(folderId, noteSinkFor(context, directoryUri), filename)
      }
    }

    AsyncFunction("findBacklinkPaths") Coroutine { titles: List<String>, aliases: List<List<String>>, paths: List<String>, folders: Map<String, String>, targetPath: String, candidatePaths: List<String>, candidateBodies: List<String> ->
      withContext(Dispatchers.Default) {
        val notes = paths.indices.map { LinkNoteRecord(paths[it], titles[it], aliases[it]) }

        findBacklinkPaths(notes, folders, targetPath, candidatePaths, candidateBodies)
      }
    }

    AsyncFunction("renameLinksInBodies") Coroutine { titles: List<String>, aliases: List<List<String>>, paths: List<String>, folders: Map<String, String>, resolveFolders: Map<String, String>?, targetPath: String, newTitle: String, bodies: List<String> ->
      withContext(Dispatchers.Default) {
        val notes = paths.indices.map { LinkNoteRecord(paths[it], titles[it], aliases[it]) }

        renameLinksInBodies(notes, folders, resolveFolders, targetPath, newTitle, bodies)
      }
    }

    AsyncFunction("versionsRead") Coroutine { rootUri: String, key: String ->
      withContext(Dispatchers.IO) { versionsFor(rootUri).read(key) }
    }

    AsyncFunction("versionsWrite") Coroutine { rootUri: String, key: String, json: String ->
      withContext(Dispatchers.IO) { versionsFor(rootUri).write(key, json) }
    }

    AsyncFunction("versionsDelete") Coroutine { rootUri: String, key: String ->
      withContext(Dispatchers.IO) { versionsFor(rootUri).delete(key) }
    }

    AsyncFunction("versionsCommit") Coroutine { rootUri: String, key: String, title: String, content: String, id: String, createdAt: Double, maxVersions: Int, maxAgeMs: Double ->
      withContext(Dispatchers.IO) { versionsFor(rootUri).commit(key, title, content, id, createdAt.toLong(), maxVersions.toUInt(), maxAgeMs.toLong()) }
    }

    AsyncFunction("versionsMigrateLegacy") Coroutine { rootUri: String, folderPath: String ->
      withContext(Dispatchers.IO) { versionsFor(rootUri).migrateLegacy(folderPath, folderPath) }
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
              filename,
              fromFolderId,
              fromPath,
              toFolderId,
              toPath,
              noteSinkFor(context, destinationUri)
            )
          )
        }
      }
    }

    Function("sanitizeFilename") { title: String, extension: String ->
      sanitizeFilename(title, extension)
    }

    Function("uniqueFilename") { existing: List<String>, stem: String, extension: String, current: String? ->
      uniqueFilename(existing, stem, extension, current)
    }

    Function("composeNote") { tags: List<String>, propertiesJson: String, invalidFrontmatter: String?, rawFrontmatter: String?, body: String ->
      composeNote(NoteFieldsRecord(tags, propertiesJson, invalidFrontmatter, rawFrontmatter), body)
    }

    Function("decomposeNote") { content: String ->
      decomposeNoteToMap(decomposeNote(content))
    }

    AsyncFunction("listIndexedNotes") Coroutine { ->
      indexLock.withLock {
        withContext(Dispatchers.IO) { listIndexed(engine()) }
      }
    }

    AsyncFunction("queryIndex") Coroutine { sql: String, params: List<Any?> ->
      withContext(Dispatchers.IO) { runQuery(engine(), sql, params) }
    }

    AsyncFunction("searchOpen") Coroutine { requestJson: String ->
      withContext(Dispatchers.IO) {
        searches.open(context, engine(), readDispatcher, requestJson)
      }
    }

    AsyncFunction("searchStep") Coroutine { id: Int, size: Int ->
      withContext(Dispatchers.IO) { searches.step(id, size) }
    }

    AsyncFunction("searchWarm") Coroutine { folderIds: List<String> ->
      withContext(Dispatchers.IO) { searches.warm(context, engine(), readDispatcher, folderIds) }
    }

    Function("searchClose") { id: Int -> searches.close(id) }

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
}

private fun revokePermissions(context: Context) {
  val resolver = context.contentResolver
  val access = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION

  resolver.persistedUriPermissions.forEach { resolver.releasePersistableUriPermission(it.uri, access) }

  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return

  val packageManager = context.packageManager
  val info = packageManager.getPackageInfo(context.packageName, PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()))
  val runtimePermissions = granted(info).filter { name ->
    runCatching { packageManager.getPermissionInfo(name, 0).protection == PermissionInfo.PROTECTION_DANGEROUS }.getOrDefault(false)
  }

  if (runtimePermissions.isNotEmpty()) context.revokeSelfPermissionsOnKill(runtimePermissions)
}

private fun granted(info: PackageInfo): List<String> {
  val names = info.requestedPermissions ?: return emptyList()
  val flags = info.requestedPermissionsFlags ?: return emptyList()

  return names.filterIndexed { index, _ -> flags[index] and PackageInfo.REQUESTED_PERMISSION_GRANTED != 0 }
}

internal var hasDirectAccess: () -> Boolean = {
  Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && Environment.isExternalStorageManager()
}

internal fun documentIdOf(context: Context, uri: Uri): String = if (DocumentsContract.isDocumentUri(context, uri)) {
  DocumentsContract.getDocumentId(uri)
} else {
  DocumentsContract.getTreeDocumentId(uri)
}

internal fun directFile(context: Context, uri: Uri): File? {
  if (uri.authority != EXTERNAL_STORAGE_AUTHORITY || !hasDirectAccess()) return null

  val documentId = runCatching { documentIdOf(context, uri) }.getOrNull() ?: return null
  val volume = documentId.substringBefore(VOLUME_SEPARATOR)
  val relativePath = documentId.substringAfter(VOLUME_SEPARATOR, "")
  val root = if (volume == PRIMARY_VOLUME) Environment.getExternalStorageDirectory() else File("/storage/$volume")

  return File(root, relativePath)
}

internal data class DirectNotesTarget(val path: String, val uriPrefix: String)

internal fun directNotesTarget(context: Context, uri: Uri): DirectNotesTarget? {
  val directory = directFile(context, uri)?.takeIf { it.isDirectory } ?: return null
  val childPrefix = DocumentsContract.buildDocumentUriUsingTree(uri, documentIdOf(context, uri) + PATH_SEPARATOR)

  return DirectNotesTarget(directory.path, childPrefix.toString())
}

internal fun listDirectory(context: Context, uri: Uri): List<Map<String, Any?>> =
  directFile(context, uri)?.takeIf { it.isDirectory && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O }?.let { listDirectDirectory(uri, documentIdOf(context, uri), it) }
    ?: listProviderDirectory(context, uri)

@RequiresApi(Build.VERSION_CODES.O)
private fun listDirectDirectory(uri: Uri, documentId: String, directory: File): List<Map<String, Any?>> =
  directory.listFiles().orEmpty().mapNotNull { file ->
    val attributes = runCatching {
      Files.readAttributes(file.toPath(), BasicFileAttributes::class.java)
    }.getOrNull() ?: return@mapNotNull null

    val childId = documentId + PATH_SEPARATOR + file.name
    val childUri = DocumentsContract.buildDocumentUriUsingTree(uri, childId).toString()
    val isDirectory = attributes.isDirectory

    mapOf(
      EntryKeys.URI to if (isDirectory) "$childUri/" else childUri,
      EntryKeys.NAME to file.name,
      EntryKeys.IS_DIRECTORY to isDirectory,
      EntryKeys.LAST_MODIFIED to attributes.lastModifiedTime().toMillis().toDouble(),
      EntryKeys.SIZE to attributes.size().toDouble()
    )
  }

private fun walkAttachments(context: Context, uri: Uri, folder: String, found: MutableList<Triple<String, String, String>>) {
  listDirectory(context, uri).forEach { entry ->
    val name = entry[EntryKeys.NAME] as String
    val entryUri = entry[EntryKeys.URI] as String

    if (name.startsWith(HIDDEN_PREFIX)) return@forEach

    if (entry[EntryKeys.IS_DIRECTORY] == true) {
      walkAttachments(context, Uri.parse(entryUri), if (folder.isEmpty()) name else "$folder$PATH_SEPARATOR$name", found)
    } else if (!name.endsWith(NOTE_EXTENSION, ignoreCase = true)) {
      found.add(Triple(entryUri, name, folder))
    }
  }
}

private fun toColumns(entries: List<Map<String, Any?>>): Map<String, List<Any?>> = mapOf(
  ColumnKeys.URIS to entries.map { it[EntryKeys.URI] },
  ColumnKeys.NAMES to entries.map { it[EntryKeys.NAME] },
  ColumnKeys.DIRECTORIES to entries.map { it[EntryKeys.IS_DIRECTORY] },
  ColumnKeys.LAST_MODIFIED to entries.map { it[EntryKeys.LAST_MODIFIED] },
  ColumnKeys.SIZES to entries.map { it[EntryKeys.SIZE] }
)

private fun entryOf(uri: Uri, documentId: String, name: String, isDirectory: Boolean, lastModified: Long?, size: Long?): Map<String, Any?> {
  val childUri = DocumentsContract.buildDocumentUriUsingTree(uri, documentId).toString()

  return mapOf(
    EntryKeys.URI to if (isDirectory) "$childUri/" else childUri,
    EntryKeys.NAME to name,
    EntryKeys.IS_DIRECTORY to isDirectory,
    EntryKeys.LAST_MODIFIED to lastModified?.toDouble(),
    EntryKeys.SIZE to size?.toDouble()
  )
}

internal fun findChild(context: Context, uri: Uri, name: String): Map<String, Any?>? {
  val childId = documentIdOf(context, uri) + PATH_SEPARATOR + name
  val file = directFile(context, uri)?.let { File(it, name) }

  if (file != null) {
    return if (file.exists()) entryOf(uri, childId, name, file.isDirectory, file.lastModified(), file.length()) else null
  }

  val childUri = DocumentsContract.buildDocumentUriUsingTree(uri, childId)

  return runCatching {
    context.contentResolver.query(childUri, CHILD_COLUMNS, null, null, null)?.use { cursor ->
      if (!cursor.moveToFirst()) return@use null

      entryOf(
        uri,
        childId,
        cursor.getString(1) ?: name,
        cursor.getString(2) == Document.MIME_TYPE_DIR,
        if (cursor.isNull(3)) null else cursor.getLong(3),
        if (cursor.isNull(4)) null else cursor.getLong(4)
      )
    }
  }.getOrNull()
}

private fun listProviderDirectory(context: Context, uri: Uri): List<Map<String, Any?>> {
  val documentId = documentIdOf(context, uri)
  val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(uri, documentId)
  val entries = mutableListOf<Map<String, Any?>>()

  context.contentResolver.query(childrenUri, CHILD_COLUMNS, null, null, null)?.use { cursor ->
    while (cursor.moveToNext()) {
      val isDirectory = cursor.getString(2) == Document.MIME_TYPE_DIR
      val childUri = DocumentsContract.buildDocumentUriUsingTree(uri, cursor.getString(0)).toString()

      entries.add(
        mapOf(
          EntryKeys.URI to if (isDirectory) "$childUri/" else childUri,
          EntryKeys.NAME to cursor.getString(1),
          EntryKeys.IS_DIRECTORY to isDirectory,
          EntryKeys.LAST_MODIFIED to if (cursor.isNull(3)) null else cursor.getLong(3).toDouble(),
          EntryKeys.SIZE to if (cursor.isNull(4)) null else cursor.getLong(4).toDouble()
        )
      )
    }
  }

  return entries
}

private fun readText(client: ContentProviderClient, uri: Uri): String? = runCatching {
  client.openFile(uri, "r")?.let(ParcelFileDescriptor::AutoCloseInputStream)?.use {
    it.readBytes().toString(Charsets.UTF_8)
  }
}.getOrNull()

private fun readText(file: File): String? = runCatching { file.readText() }.getOrNull()

suspend fun <T> readAll(
  context: Context,
  uris: List<String>,
  dispatcher: CoroutineDispatcher,
  transform: (String) -> T
): List<T?> {
  val documents = uris.map(Uri::parse)
  val client = lazy {
    documents.firstOrNull()?.authority?.let(context.contentResolver::acquireUnstableContentProviderClient)
  }

  return try {
    coroutineScope {
      documents.map { uri ->
        async(dispatcher) {
          (directFile(context, uri)?.let(::readText) ?: client.value?.let { readText(it, uri) })?.let(transform)
        }
      }.awaitAll()
    }
  } finally {
    if (client.isInitialized()) client.value?.close()
  }
}

