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
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext

private const val READ_PARALLELISM = 16
private const val EXTERNAL_STORAGE_AUTHORITY = "com.android.externalstorage.documents"
private const val PRIMARY_VOLUME = "primary"
private const val VOLUME_SEPARATOR = ":"
private const val PATH_SEPARATOR = "/"

private val CHILD_COLUMNS = arrayOf(
  Document.COLUMN_DOCUMENT_ID,
  Document.COLUMN_DISPLAY_NAME,
  Document.COLUMN_MIME_TYPE,
  Document.COLUMN_LAST_MODIFIED,
  Document.COLUMN_SIZE
)

class RepositoryFsModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val readDispatcher = Dispatchers.IO.limitedParallelism(READ_PARALLELISM)

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
      val documents = uris.map(Uri::parse)
      val client = lazy {
        documents.firstOrNull()?.authority?.let(context.contentResolver::acquireUnstableContentProviderClient)
      }

      try {
        coroutineScope {
          documents.map { uri ->
            async(readDispatcher) { directFile(context, uri)?.let(::readText) ?: client.value?.let { readText(it, uri) } }
          }.awaitAll()
        }
      } finally {
        if (client.isInitialized()) client.value?.close()
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

private fun hasDirectAccess(): Boolean =
  Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && Environment.isExternalStorageManager()

private fun documentIdOf(context: Context, uri: Uri): String = if (DocumentsContract.isDocumentUri(context, uri)) {
  DocumentsContract.getDocumentId(uri)
} else {
  DocumentsContract.getTreeDocumentId(uri)
}

private fun directFile(context: Context, uri: Uri): File? {
  if (uri.authority != EXTERNAL_STORAGE_AUTHORITY || !hasDirectAccess()) return null

  val documentId = runCatching { documentIdOf(context, uri) }.getOrNull() ?: return null
  val volume = documentId.substringBefore(VOLUME_SEPARATOR)
  val relativePath = documentId.substringAfter(VOLUME_SEPARATOR, "")
  val root = if (volume == PRIMARY_VOLUME) Environment.getExternalStorageDirectory() else File("/storage/$volume")

  return File(root, relativePath)
}

private fun listDirectory(context: Context, uri: Uri): List<Map<String, Any?>> =
  directFile(context, uri)?.takeIf { it.isDirectory }?.let { listDirectDirectory(uri, documentIdOf(context, uri), it) }
    ?: listProviderDirectory(context, uri)

private fun listDirectDirectory(uri: Uri, documentId: String, directory: File): List<Map<String, Any?>> =
  directory.listFiles().orEmpty().map { file ->
    val childId = documentId + PATH_SEPARATOR + file.name
    val childUri = DocumentsContract.buildDocumentUriUsingTree(uri, childId).toString()
    val isDirectory = file.isDirectory

    mapOf(
      "uri" to if (isDirectory) "$childUri/" else childUri,
      "name" to file.name,
      "isDirectory" to isDirectory,
      "lastModified" to file.lastModified().toDouble(),
      "size" to file.length().toDouble()
    )
  }

private fun toColumns(entries: List<Map<String, Any?>>): Map<String, List<Any?>> = mapOf(
  "uris" to entries.map { it["uri"] },
  "names" to entries.map { it["name"] },
  "directories" to entries.map { it["isDirectory"] },
  "lastModified" to entries.map { it["lastModified"] },
  "sizes" to entries.map { it["size"] }
)

private fun entryOf(uri: Uri, documentId: String, name: String, isDirectory: Boolean, lastModified: Long?, size: Long?): Map<String, Any?> {
  val childUri = DocumentsContract.buildDocumentUriUsingTree(uri, documentId).toString()

  return mapOf(
    "uri" to if (isDirectory) "$childUri/" else childUri,
    "name" to name,
    "isDirectory" to isDirectory,
    "lastModified" to lastModified?.toDouble(),
    "size" to size?.toDouble()
  )
}

private fun findChild(context: Context, uri: Uri, name: String): Map<String, Any?>? {
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
          "uri" to if (isDirectory) "$childUri/" else childUri,
          "name" to cursor.getString(1),
          "isDirectory" to isDirectory,
          "lastModified" to if (cursor.isNull(3)) null else cursor.getLong(3).toDouble(),
          "size" to if (cursor.isNull(4)) null else cursor.getLong(4).toDouble()
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
