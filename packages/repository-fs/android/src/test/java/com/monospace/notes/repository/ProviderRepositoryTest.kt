package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import uniffi.engine.EngineException
import uniffi.engine.MoveStatus

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ProviderVaultTest {
  private lateinit var fixture: SafFixture

  @Before
  fun setUp() {
    fixture = SafFixture()
  }

  private fun vault() = vaultFor(fixture.context, fixture.root.toString())

  @Test
  fun `writes create the missing directories along the path`() {
    vault().writeText(".notes/deep/file.json", "{}")

    val notes = findChild(fixture.context, fixture.root, ".notes")!!
    val deep = findChild(fixture.context, android.net.Uri.parse((notes[EntryKeys.URI] as String).trimEnd('/')), "deep")

    assertEquals(true, deep?.get(EntryKeys.IS_DIRECTORY))
  }

  @Test
  fun `reads back what was written`() {
    val vault = vault()

    vault.writeText(".notes/a.json", "{\"a\":1}")

    assertEquals("{\"a\":1}", vault.readText(".notes/a.json"))
  }

  @Test
  fun `overwriting truncates the previous content`() {
    val vault = vault()
    vault.writeText("a.json", "a long first version")

    vault.writeText("a.json", "{}")

    assertEquals("{}", vault.readText("a.json"))
  }

  @Test
  fun `reading a missing file or directory gives null`() {
    val vault = vault()

    assertNull(vault.readText("missing.json"))
    assertNull(vault.readText("no/such/dir/file.json"))
  }

  @Test
  fun `lists only files of a directory`() {
    val vault = vault()
    vault.writeText(".notes/b.json", "1")
    vault.writeText(".notes/a.json", "2")
    vault.writeText(".notes/sub/c.json", "3")

    assertEquals(listOf("a.json", "b.json"), vault.listFiles(".notes").sorted())
    assertEquals(emptyList<String>(), vault.listFiles("nothing"))
  }

  @Test
  fun `deleting removes the file and ignores a missing one`() {
    val vault = vault()
    vault.writeText(".notes/a.json", "1")

    vault.deleteFile(".notes/a.json")
    vault.deleteFile(".notes/a.json")

    assertNull(vault.readText(".notes/a.json"))
  }

  @Test
  fun `exists reports files and directories and the root`() {
    val vault = vault()
    vault.writeText("dir/note.md", "x")

    assertTrue(vault.exists(""))
    assertTrue(vault.exists("dir"))
    assertTrue(vault.exists("dir/note.md"))
    assertFalse(vault.exists("dir/missing.md"))
    assertFalse(vault.exists("nope/note.md"))
  }

  @Test
  fun `creating a directory twice keeps it`() {
    val vault = vault()

    vault.createDir("a/b")
    vault.createDir("a/b")

    assertTrue(vault.exists("a/b"))
  }

  @Test
  fun `renaming a directory keeps its notes and frees the old name`() {
    val vault = vault()
    vault.writeText("old/note.md", "text")

    vault.renameDir("old", "fresh")

    assertFalse(vault.exists("old"))
    assertEquals("text", vault.readText("fresh/note.md"))
  }

  @Test
  fun `renaming onto an existing directory is refused`() {
    val vault = vault()
    vault.writeText("old/note.md", "old")
    vault.writeText("taken/note.md", "taken")

    try {
      vault.renameDir("old", "taken")
      throw AssertionError("expected an AlreadyExists error")
    } catch (error: EngineException.AlreadyExists) {
      assertEquals("old", vault.readText("old/note.md"))
    }
  }

  @Test
  fun `moving a file with the same name uses a provider move`() {
    val vault = vault()
    vault.writeText("a/note.md", "text")
    vault.createDir("b")

    assertEquals(MoveStatus.MOVED, vault.moveFile("a/note.md", "b/note.md"))
    assertEquals("text", vault.readText("b/note.md"))
    assertNull(vault.readText("a/note.md"))
  }

  @Test
  fun `moving a file under another name copies it and removes the source`() {
    val vault = vault()
    vault.writeText("a/note.md", "text")
    vault.createDir("trash")

    assertEquals(MoveStatus.MOVED, vault.moveFile("a/note.md", "trash/note (2).md"))
    assertEquals("text", vault.readText("trash/note (2).md"))
    assertNull(vault.readText("a/note.md"))
  }

  @Test
  fun `moving never overwrites and reports a missing source`() {
    val vault = vault()
    vault.writeText("a/note.md", "mine")
    vault.writeText("b/note.md", "theirs")

    assertEquals(MoveStatus.TARGET_EXISTS, vault.moveFile("a/note.md", "b/note.md"))
    assertEquals(MoveStatus.SOURCE_MISSING, vault.moveFile("a/gone.md", "b/gone.md"))
    assertEquals("mine", vault.readText("a/note.md"))
    assertEquals("theirs", vault.readText("b/note.md"))
  }

  @Test
  fun `removing a directory deletes it with its notes and ignores a missing one`() {
    val vault = vault()
    vault.writeText("a/b/note.md", "x")

    vault.removeDir("a")
    vault.removeDir("a")

    assertFalse(vault.exists("a"))
  }
}
