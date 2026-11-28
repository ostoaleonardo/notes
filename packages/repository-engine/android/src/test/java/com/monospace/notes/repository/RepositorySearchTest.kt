package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

private const val UNKNOWN_SEARCH = 99
private const val SEARCH_PAGE = 10

class RepositorySearchTest {
    @Test
    fun `a search that is not open has nothing more to give`() {
        val step = SearchRegistry().step(UNKNOWN_SEARCH, SEARCH_PAGE)

        assertTrue((step[SearchKeys.FILENAMES] as List<*>).isEmpty())
        assertTrue((step[SearchKeys.FOLDER_IDS] as List<*>).isEmpty())
        assertEquals(true, step[SearchKeys.DONE])
    }
}
