package com.monospace.notes.repository

import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import uniffi.engine.NoteFieldsRecord
import uniffi.engine.composeNote
import uniffi.engine.decomposeNote
import uniffi.engine.sanitizeFilename
import uniffi.engine.uniqueFilename

internal fun ModuleDefinitionBuilder.defineNames(runtime: RepositoryRuntime) = with(runtime) {
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
}
