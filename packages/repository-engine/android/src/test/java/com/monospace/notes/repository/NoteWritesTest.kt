package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import uniffi.engine.DecomposedRecord
import uniffi.engine.FileStamp
import uniffi.engine.SaveReport

class NoteWritesTest {
    @Test
    fun `saved report exposes the new stamp`() {
        val report = SaveReport.Saved(FileStamp("content://note", 42L, 7L))

        assertEquals(
            mapOf(
                SaveKeys.STATUS to SaveKeys.SAVED,
                SaveKeys.URI to "content://note",
                SaveKeys.MODIFIED to 42L,
                SaveKeys.SIZE to 7L
            ),
            saveReportToMap(report)
        )
    }

    @Test
    fun `conflict report carries the modified time found on disk`() {
        assertEquals(
            mapOf(SaveKeys.STATUS to SaveKeys.CONFLICT, SaveKeys.DISK_MODIFIED to 99L),
            saveReportToMap(SaveReport.Conflict(99L))
        )
    }

    @Test
    fun `missing and failed reports only carry their status`() {
        assertEquals(mapOf(SaveKeys.STATUS to SaveKeys.MISSING), saveReportToMap(SaveReport.Missing))
        assertEquals(mapOf(SaveKeys.STATUS to SaveKeys.FAILED), saveReportToMap(SaveReport.Failed("disk full")))
    }

    @Test
    fun `decomposed note keeps every part and null frontmatter fields`() {
        val parts = DecomposedRecord("body", listOf("a", "b"), "{\"k\":1}", null, "raw")
        val map = decomposeNoteToMap(parts)

        assertEquals("body", map[DecomposedKeys.BODY])
        assertEquals(listOf("a", "b"), map[DecomposedKeys.TAGS])
        assertEquals("{\"k\":1}", map[DecomposedKeys.PROPERTIES_JSON])
        assertNull(map[DecomposedKeys.INVALID_FRONTMATTER])
        assertEquals("raw", map[DecomposedKeys.RAW_FRONTMATTER])
        assertTrue(map.containsKey(DecomposedKeys.INVALID_FRONTMATTER))
    }
}
