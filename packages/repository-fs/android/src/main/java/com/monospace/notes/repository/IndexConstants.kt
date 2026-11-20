package com.monospace.notes.repository

internal const val INDEX_DATABASE_NAME = "repository-index.db"
internal const val INDEX_PROGRESS_EVENT = "onIndexProgress"
internal const val INDEX_BATCH_SIZE = 500
internal const val PIPELINE_DEPTH = 1
internal const val NANOS_PER_MILLI = 1_000_000L

internal object ProgressKeys {
  const val FOLDER_ID = "folderId"
  const val DONE = "done"
  const val TOTAL = "total"
}

internal object StatsKeys {
  const val TOTAL = "total"
  const val ADDED = "added"
  const val UPDATED = "updated"
  const val REMOVED = "removed"
  const val UNCHANGED = "unchanged"
  const val UNREADABLE = "unreadable"
  const val SCAN_MS = "scanMs"
  const val READ_PARSE_MS = "readParseMs"
  const val WRITE_MS = "writeMs"
}

internal object QueryKeys {
  const val COLUMNS = "columns"
  const val VALUES = "values"
}

internal object IndexedKeys {
  const val FOLDER_IDS = "folderIds"
  const val FILENAMES = "filenames"
  const val MODIFIED = "modified"
}

internal object SaveKeys {
  const val STATUS = "status"
  const val URI = "uri"
  const val MODIFIED = "modified"
  const val SIZE = "size"
  const val DISK_MODIFIED = "diskModified"
  const val SAVED = "saved"
  const val CONFLICT = "conflict"
  const val MISSING = "missing"
  const val FAILED = "failed"
}

internal object DecomposedKeys {
  const val BODY = "body"
  const val TAGS = "tags"
  const val PROPERTIES_JSON = "propertiesJson"
  const val INVALID_FRONTMATTER = "invalidFrontmatter"
  const val RAW_FRONTMATTER = "rawFrontmatter"
}

internal const val WRITE_ATTEMPTS = 3
internal const val MARKDOWN_MIME_TYPE = "text/markdown"
internal const val WRITE_TRUNCATE_MODE = "wt"

internal const val VAULT_JSON_MIME = "application/json"
