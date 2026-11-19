package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import uniffi.engine.DecomposedRecord
import uniffi.engine.FileStampRecord
import uniffi.engine.FsNoteSink
import uniffi.engine.NoteSink
import uniffi.engine.SaveReport

private class ProviderNoteSink(private val context: Context, private val directory: Uri) : NoteSink {
  override fun stat(filename: String): FileStampRecord? = findChild(context, directory, filename)?.let(::stampOf)

  override fun write(filename: String, text: String): FileStampRecord {
    val bytes = text.toByteArray(Charsets.UTF_8)

    repeat(WRITE_ATTEMPTS) {
      val target = childUri(filename) ?: createChild(filename)

      context.contentResolver.openOutputStream(target, WRITE_TRUNCATE_MODE)?.use { it.write(bytes) }

      stat(filename)?.takeIf { it.size == bytes.size.toLong() }?.let { return it }
    }

    throw java.io.IOException("write verification failed for $filename")
  }

  override fun delete(filename: String) {
    childUri(filename)?.let { runCatching { DocumentsContract.deleteDocument(context.contentResolver, it) } }
  }

  private fun childUri(filename: String): Uri? =
    findChild(context, directory, filename)?.let { Uri.parse(it[EntryKeys.URI] as String) }

  private fun createChild(filename: String): Uri {
    val parent = DocumentsContract.buildDocumentUriUsingTree(directory, documentIdOf(context, directory))

    return DocumentsContract.createDocument(context.contentResolver, parent, MARKDOWN_MIME_TYPE, filename)
      ?: throw java.io.IOException("cannot create $filename")
  }

  private fun stampOf(entry: Map<String, Any?>) = FileStampRecord(
    entry[EntryKeys.URI] as String,
    (entry[EntryKeys.LAST_MODIFIED] as Double?)?.toLong() ?: 0L,
    (entry[EntryKeys.SIZE] as Double?)?.toLong() ?: 0L
  )
}

internal fun noteSinkFor(context: Context, directoryUri: String): NoteSink {
  val uri = Uri.parse(directoryUri)

  return directNotesTarget(context, uri)?.let { FsNoteSink(it.path, it.uriPrefix) } ?: ProviderNoteSink(context, uri)
}

internal fun saveReportToMap(report: SaveReport): Map<String, Any> = when (report) {
  is SaveReport.Saved -> mapOf(
    SaveKeys.STATUS to SaveKeys.SAVED,
    SaveKeys.URI to report.stamp.uri,
    SaveKeys.MODIFIED to report.stamp.modified,
    SaveKeys.SIZE to report.stamp.size
  )
  is SaveReport.Conflict -> mapOf(SaveKeys.STATUS to SaveKeys.CONFLICT, SaveKeys.DISK_MODIFIED to report.diskModified)
  is SaveReport.Missing -> mapOf(SaveKeys.STATUS to SaveKeys.MISSING)
  is SaveReport.Failed -> mapOf(SaveKeys.STATUS to SaveKeys.FAILED)
}

internal fun decomposeNoteToMap(parts: DecomposedRecord): Map<String, Any?> = mapOf(
  DecomposedKeys.BODY to parts.body,
  DecomposedKeys.TAGS to parts.tags,
  DecomposedKeys.PROPERTIES_JSON to parts.propertiesJson,
  DecomposedKeys.INVALID_FRONTMATTER to parts.invalidFrontmatter,
  DecomposedKeys.RAW_FRONTMATTER to parts.rawFrontmatter
)
