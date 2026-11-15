package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Test

class ReconcilerTest {
  private fun file(name: String, modified: Long = 1, size: Long = 1) = ScannedFile("content://$name", name, modified, size)

  @Test
  fun `parses every file when the index is empty`() {
    val plan = planReconcile(emptyMap(), listOf(file("a.md"), file("b.md")))

    assertEquals(2, plan.added)
    assertEquals(2, plan.changed.size)
    assertEquals(0, plan.unchanged)
  }

  @Test
  fun `skips files whose modified time and size match`() {
    val plan = planReconcile(mapOf("a.md" to FileMeta(1, 1)), listOf(file("a.md")))

    assertEquals(0, plan.changed.size)
    assertEquals(1, plan.unchanged)
  }

  @Test
  fun `reparses a file when its modified time changes`() {
    val plan = planReconcile(mapOf("a.md" to FileMeta(1, 1)), listOf(file("a.md", modified = 2)))

    assertEquals(1, plan.updated)
    assertEquals(listOf("a.md"), plan.changed.map { it.filename })
  }

  @Test
  fun `reparses a file when its size changes`() {
    val plan = planReconcile(mapOf("a.md" to FileMeta(1, 1)), listOf(file("a.md", size = 9)))

    assertEquals(1, plan.updated)
  }

  @Test
  fun `removes indexed files that are no longer on disk`() {
    val plan = planReconcile(
      mapOf("a.md" to FileMeta(1, 1), "gone.md" to FileMeta(1, 1)),
      listOf(file("a.md"))
    )

    assertEquals(listOf("gone.md"), plan.removed)
    assertEquals(1, plan.unchanged)
  }

  @Test
  fun `handles added updated removed and unchanged files together`() {
    val plan = planReconcile(
      mapOf("keep.md" to FileMeta(1, 1), "edit.md" to FileMeta(1, 1), "gone.md" to FileMeta(1, 1)),
      listOf(file("keep.md"), file("edit.md", modified = 5), file("new.md"))
    )

    assertEquals(1, plan.added)
    assertEquals(1, plan.updated)
    assertEquals(1, plan.unchanged)
    assertEquals(listOf("gone.md"), plan.removed)
  }
}
