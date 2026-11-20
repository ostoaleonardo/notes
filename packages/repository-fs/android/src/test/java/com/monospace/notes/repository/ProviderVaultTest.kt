package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

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
}
