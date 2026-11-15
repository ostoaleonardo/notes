package com.monospace.notes.repository

data class ScannedFile(val uri: String, val filename: String, val modified: Long, val size: Long)

data class ReconcilePlan(
  val changed: List<ScannedFile>,
  val removed: List<String>,
  val added: Int,
  val updated: Int,
  val unchanged: Int
)

fun planReconcile(existing: Map<String, FileMeta>, scanned: List<ScannedFile>): ReconcilePlan {
  val changed = ArrayList<ScannedFile>()
  var added = 0
  var updated = 0

  for (file in scanned) {
    val known = existing[file.filename]

    when {
      known == null -> {
        added++
        changed.add(file)
      }

      known.modified != file.modified || known.size != file.size -> {
        updated++
        changed.add(file)
      }
    }
  }

  val present = scanned.mapTo(HashSet()) { it.filename }

  return ReconcilePlan(
    changed = changed,
    removed = existing.keys.filter { it !in present },
    added = added,
    updated = updated,
    unchanged = scanned.size - changed.size
  )
}
