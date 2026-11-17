package com.monospace.notes.repository

import android.content.Context
import java.io.File
import java.util.Locale
import uniffi.engine.Engine
import uniffi.engine.NoteRefsReport
import uniffi.engine.Value

fun openEngine(context: Context): Engine {
  val directory = File(context.filesDir, DATABASE_DIRECTORY).apply { mkdirs() }

  return Engine(File(directory, INDEX_DATABASE_NAME).path, Locale.getDefault().toLanguageTag())
}

fun toValue(raw: Any?): Value = when (raw) {
  null -> Value.Null
  is Boolean -> Value.Integer(if (raw) 1L else 0L)
  is Int -> Value.Integer(raw.toLong())
  is Long -> Value.Integer(raw)
  is Double -> if (raw % 1.0 == 0.0 && Math.abs(raw) < Long.MAX_VALUE) Value.Integer(raw.toLong()) else Value.Real(raw)
  else -> Value.Text(raw.toString())
}

fun fromValue(value: Value): Any? = when (value) {
  is Value.Null -> null
  is Value.Integer -> value.value
  is Value.Real -> value.value
  is Value.Text -> value.value
}

fun runQuery(engine: Engine, sql: String, params: List<Any?>): Map<String, Any> {
  val report = engine.query(sql, params.map(::toValue))
  val values = report.columns.indices.map { column -> report.rows.map { row -> fromValue(row[column]) } }

  return mapOf(QueryKeys.COLUMNS to report.columns, QueryKeys.VALUES to values)
}

fun listIndexed(engine: Engine): Map<String, List<Any>> {
  val notes = engine.indexedNotes()

  return mapOf(
    IndexedKeys.REPOSITORY_IDS to notes.repositoryIds,
    IndexedKeys.FILENAMES to notes.filenames,
    IndexedKeys.MODIFIED to notes.modified
  )
}

fun toRefs(report: NoteRefsReport): Map<String, List<String>> = mapOf(
  IndexedKeys.REPOSITORY_IDS to report.repositoryIds,
  IndexedKeys.FILENAMES to report.filenames
)
