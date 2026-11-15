package com.monospace.notes.repository

internal const val INDEX_SCHEMA_VERSION = 2
internal const val INDEX_DATABASE_NAME = "repository-index.db"
internal const val INDEX_PROGRESS_EVENT = "onIndexProgress"
internal const val INDEX_BATCH_SIZE = 500
internal const val PIPELINE_DEPTH = 1
internal const val NANOS_PER_MILLI = 1_000_000L
internal const val INVALID_FRONTMATTER = 1L
internal const val VALID_FRONTMATTER = 0L

internal object ProgressKeys {
  const val REPOSITORY_ID = "repositoryId"
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

internal object IndexedKeys {
  const val REPOSITORY_IDS = "repositoryIds"
  const val FILENAMES = "filenames"
  const val MODIFIED = "modified"
}
