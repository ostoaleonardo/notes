package com.monospace.notes.repository

import android.net.Uri
import java.io.IOException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class VaultMovesTest {
  private lateinit var fixture: SafFixture

  @Before
  fun setUp() {
    fixture = SafFixture()
  }

  @Test
  fun `renaming a directory returns its new uri ending in a slash`() {
    val old = fixture.directory(fixture.root, "old")
    fixture.file(old, "note.md", "text")

    val renamed = renameDirectory(fixture.context, "$old/", fixture.root.toString(), "fresh")

    assertTrue(renamed.endsWith("/"))
    assertEquals(listOf("fresh"), fixture.names(fixture.root))
    assertEquals("text", fixture.read(Uri.parse(renamed.trimEnd('/')), "note.md"))
  }

  @Test(expected = IOException::class)
  fun `renaming onto an existing directory fails`() {
    val old = fixture.directory(fixture.root, "old")
    fixture.directory(fixture.root, "taken")

    renameDirectory(fixture.context, old.toString(), fixture.root.toString(), "taken")
  }

  @Test
  fun `moving a file puts it in the destination and removes it from the source`() {
    val source = fixture.directory(fixture.root, "source")
    val destination = fixture.directory(fixture.root, "destination")
    fixture.file(source, "note.md", "text")

    val moved = moveFile(fixture.context, source.toString(), "note.md", destination.toString())

    assertTrue(moved)
    assertEquals(emptyList<String>(), fixture.names(source))
    assertEquals("text", fixture.read(destination, "note.md"))
  }

  @Test
  fun `moving does not overwrite a note with the same name`() {
    val source = fixture.directory(fixture.root, "source")
    val destination = fixture.directory(fixture.root, "destination")
    fixture.file(source, "note.md", "mine")
    fixture.file(destination, "note.md", "theirs")

    assertFalse(moveFile(fixture.context, source.toString(), "note.md", destination.toString()))
    assertEquals("mine", fixture.read(source, "note.md"))
    assertEquals("theirs", fixture.read(destination, "note.md"))
  }

  @Test
  fun `moving a missing file reports failure`() {
    val source = fixture.directory(fixture.root, "source")
    val destination = fixture.directory(fixture.root, "destination")

    assertFalse(moveFile(fixture.context, source.toString(), "gone.md", destination.toString()))
  }
}
