package com.monospace.notes.repository

import android.provider.DocumentsContract.Document

internal const val READ_PARALLELISM = 16
internal const val DATABASE_DIRECTORY = "SQLite"
internal const val EXTERNAL_STORAGE_AUTHORITY = "com.android.externalstorage.documents"
internal const val PRIMARY_VOLUME = "primary"
internal const val VOLUME_SEPARATOR = ":"
internal const val PATH_SEPARATOR = "/"
internal const val HIDDEN_PREFIX = "."
internal const val NOTE_EXTENSION = ".md"

internal val CHILD_COLUMNS = arrayOf(
  Document.COLUMN_DOCUMENT_ID,
  Document.COLUMN_DISPLAY_NAME,
  Document.COLUMN_MIME_TYPE,
  Document.COLUMN_LAST_MODIFIED,
  Document.COLUMN_SIZE
)

internal object EntryKeys {
  const val URI = "uri"
  const val NAME = "name"
  const val IS_DIRECTORY = "isDirectory"
  const val LAST_MODIFIED = "lastModified"
  const val SIZE = "size"
}

internal object ColumnKeys {
  const val URIS = "uris"
  const val NAMES = "names"
  const val DIRECTORIES = "directories"
  const val LAST_MODIFIED = "lastModified"
  const val SIZES = "sizes"
  const val FOLDERS = "folders"
}
