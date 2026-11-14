package com.monospace.notes.repository

import android.content.ContentProviderClient
import android.content.Context
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.provider.DocumentsContract
import android.provider.DocumentsContract.Document
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext

private const val READ_PARALLELISM = 16

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

    Function("listDirectorySync") { uri: String ->
      listDirectory(context, Uri.parse(uri))
    }

    AsyncFunction("listDirectory") Coroutine { uri: String ->
      withContext(Dispatchers.IO) { listDirectory(context, Uri.parse(uri)) }
    }

    AsyncFunction("readTextFiles") Coroutine { uris: List<String> ->
      val documents = uris.map(Uri::parse)
      val client = documents.firstOrNull()?.authority?.let(context.contentResolver::acquireUnstableContentProviderClient)
        ?: return@Coroutine emptyList<String?>()

      try {
        coroutineScope {
          documents.map { uri -> async(readDispatcher) { readText(client, uri) } }.awaitAll()
        }
      } finally {
        client.close()
      }
    }
  }
}

private fun listDirectory(context: Context, uri: Uri): List<Map<String, Any?>> {
  val documentId = if (DocumentsContract.isDocumentUri(context, uri)) {
    DocumentsContract.getDocumentId(uri)
  } else {
    DocumentsContract.getTreeDocumentId(uri)
  }
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
