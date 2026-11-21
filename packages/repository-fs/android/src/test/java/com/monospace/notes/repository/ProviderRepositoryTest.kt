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
class ProviderRepositoryTest {
  private lateinit var fixture: SafFixture

  @Before
  fun setUp() {
    fixture = SafFixture()
  }

  private fun repository() = repositoryFor(fixture.context, fixture.root.toString())

  @Test
  fun `writes create the missing directories along the path`() {
    repository().writeText(".notes/deep/file.json", "{}")

    val notes = findChild(fixture.context, fixture.root, ".notes")!!
    val deep = findChild(fixture.context, android.net.Uri.parse((notes[EntryKeys.URI] as String).trimEnd('/')), "deep")

    assertEquals(true, deep?.get(EntryKeys.IS_DIRECTORY))
  }

  @Test
  fun `reads back what was written`() {
    val repository = repository()

    repository.writeText(".notes/a.json", "{\"a\":1}")

    assertEquals("{\"a\":1}", repository.readText(".notes/a.json"))
  }

  @Test
  fun `overwriting truncates the previous content`() {
    val repository = repository()
    repository.writeText("a.json", "a long first version")

    repository.writeText("a.json", "{}")

    assertEquals("{}", repository.readText("a.json"))
  }

  @Test
  fun `reading a missing file or directory gives null`() {
    val repository = repository()

    assertNull(repository.readText("missing.json"))
    assertNull(repository.readText("no/such/dir/file.json"))
  }

  @Test
  fun `lists only files of a directory`() {
    val repository = repository()
    repository.writeText(".notes/b.json", "1")
    repository.writeText(".notes/a.json", "2")
    repository.writeText(".notes/sub/c.json", "3")

    assertEquals(listOf("a.json", "b.json"), repository.listFiles(".notes").sorted())
    assertEquals(emptyList<String>(), repository.listFiles("nothing"))
  }

  @Test
  fun `deleting removes the file and ignores a missing one`() {
    val repository = repository()
    repository.writeText(".notes/a.json", "1")

    repository.deleteFile(".notes/a.json")
    repository.deleteFile(".notes/a.json")

    assertNull(repository.readText(".notes/a.json"))
  }

  @Test
  fun `exists reports files and directories and the root`() {
    val repository = repository()
    repository.writeText("dir/note.md", "x")

    assertTrue(repository.exists(""))
    assertTrue(repository.exists("dir"))
    assertTrue(repository.exists("dir/note.md"))
    assertFalse(repository.exists("dir/missing.md"))
    assertFalse(repository.exists("nope/note.md"))
  }

  @Test
  fun `creating a directory twice keeps it`() {
    val repository = repository()

    repository.createDir("a/b")
    repository.createDir("a/b")

    assertTrue(repository.exists("a/b"))
  }

  @Test
  fun `renaming a directory keeps its notes and frees the old name`() {
    val repository = repository()
    repository.writeText("old/note.md", "text")

    repository.renameDir("old", "fresh")

    assertFalse(repository.exists("old"))
    assertEquals("text", repository.readText("fresh/note.md"))
  }

  @Test
  fun `renaming onto an existing directory is refused`() {
    val repository = repository()
    repository.writeText("old/note.md", "old")
    repository.writeText("taken/note.md", "taken")

    try {
      repository.renameDir("old", "taken")
      throw AssertionError("expected an AlreadyExists error")
    } catch (error: EngineException.AlreadyExists) {
      assertEquals("old", repository.readText("old/note.md"))
    }
  }

  @Test
  fun `moving a file with the same name uses a provider move`() {
    val repository = repository()
    repository.writeText("a/note.md", "text")
    repository.createDir("b")

    assertEquals(MoveStatus.MOVED, repository.moveFile("a/note.md", "b/note.md"))
    assertEquals("text", repository.readText("b/note.md"))
    assertNull(repository.readText("a/note.md"))
  }

  @Test
  fun `moving a file under another name copies it and removes the source`() {
    val repository = repository()
    repository.writeText("a/note.md", "text")
    repository.createDir("trash")

    assertEquals(MoveStatus.MOVED, repository.moveFile("a/note.md", "trash/note (2).md"))
    assertEquals("text", repository.readText("trash/note (2).md"))
    assertNull(repository.readText("a/note.md"))
  }

  @Test
  fun `moving never overwrites and reports a missing source`() {
    val repository = repository()
    repository.writeText("a/note.md", "mine")
    repository.writeText("b/note.md", "theirs")

    assertEquals(MoveStatus.TARGET_EXISTS, repository.moveFile("a/note.md", "b/note.md"))
    assertEquals(MoveStatus.SOURCE_MISSING, repository.moveFile("a/gone.md", "b/gone.md"))
    assertEquals("mine", repository.readText("a/note.md"))
    assertEquals("theirs", repository.readText("b/note.md"))
  }

  @Test
  fun `removing a directory deletes it with its notes and ignores a missing one`() {
    val repository = repository()
    repository.writeText("a/b/note.md", "x")

    repository.removeDir("a")
    repository.removeDir("a")

    assertFalse(repository.exists("a"))
  }

  @Test
  fun `listing a directory reports files and directories sorted by name`() {
    val repository = repository()
    repository.writeText("b.md", "x")
    repository.createDir("a")
    repository.writeText("c/inner.md", "x")

    val listed = repository.listDir("").map { it.name to it.isDir }

    assertEquals(listOf("a" to true, "b.md" to false, "c" to true), listed)
  }

  @Test
  fun `listing a missing directory gives nothing`() {
    assertEquals(emptyList<String>(), repository().listDir("ghost").map { it.name })
  }
}
