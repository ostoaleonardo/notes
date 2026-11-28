package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ProviderNoteSinkTest {
  private lateinit var fixture: SafFixture

  @Before
  fun setUp() {
    fixture = SafFixture()
  }

  private fun sink(directory: android.net.Uri = fixture.root) = noteSinkFor(fixture.context, directory.toString())

  @Test
  fun `writing creates the note and reports its size`() {
    val stamp = sink().write("note.md", "héllo")

    assertEquals("héllo".toByteArray().size.toLong(), stamp.size)
    assertEquals("héllo", fixture.read(fixture.root, "note.md"))
  }

  @Test
  fun `writing again replaces the previous text`() {
    val sink = sink()
    sink.write("note.md", "a much longer first text")
    val stamp = sink.write("note.md", "short")

    assertEquals(5L, stamp.size)
    assertEquals("short", fixture.read(fixture.root, "note.md"))
  }

  @Test
  fun `stat is null for a missing note and a stamp for an existing one`() {
    val sink = sink()

    assertNull(sink.stat("note.md"))

    sink.write("note.md", "text")

    assertEquals(4L, sink.stat("note.md")?.size)
  }

  @Test
  fun `deleting removes the note and ignores a missing one`() {
    val sink = sink()
    sink.write("note.md", "text")

    sink.delete("note.md")
    sink.delete("note.md")

    assertNull(sink.stat("note.md"))
  }

  @Test
  fun `writes into a nested directory`() {
    val nested = fixture.directory(fixture.root, "inner")

    sink(nested).write("note.md", "nested")

    assertNotNull(findChild(fixture.context, nested, "note.md"))
    assertEquals("nested", fixture.read(nested, "note.md"))
  }
}
