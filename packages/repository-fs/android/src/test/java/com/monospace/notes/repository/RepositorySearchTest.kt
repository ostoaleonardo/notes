package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

private const val UNKNOWN_SEARCH = 99
private const val SEARCH_PAGE = 10
private const val QUERY = """{"type":"null"}"""
private const val SORT = "modified-desc"

class RepositorySearchTest {
  @Test
  fun `pairs each folder id with its path`() {
    val request = searchRequest(
      QUERY,
      SORT,
      listOf("a", "b"),
      listOf("a", "b"),
      listOf("Work", ""),
      listOf("a::note.md"),
      true
    )

    assertEquals(listOf("a", "b"), request.folderPaths.map { it.folderId })
    assertEquals(listOf("Work", ""), request.folderPaths.map { it.path })
    assertEquals(listOf("a::note.md"), request.pinned)
    assertEquals(SORT, request.sort)
    assertTrue(request.matchCase)
  }

  @Test
  fun `a search that is not open has nothing more to give`() {
    val step = SearchRegistry().step(UNKNOWN_SEARCH, SEARCH_PAGE)

    assertTrue((step[SearchKeys.FILENAMES] as List<*>).isEmpty())
    assertTrue((step[SearchKeys.FOLDER_IDS] as List<*>).isEmpty())
    assertEquals(true, step[SearchKeys.DONE])
  }
}
