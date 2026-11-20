package com.monospace.notes.repository

import android.content.Context
import android.content.Intent
import android.content.pm.ProviderInfo
import android.content.pm.ResolveInfo
import android.net.Uri
import android.os.Environment
import android.provider.DocumentsContract
import androidx.test.core.app.ApplicationProvider
import java.io.File
import java.io.IOException
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Shadows.shadowOf
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private const val VAULT_NAME = "vault"
private const val EXTERNAL_AUTHORITY = "com.android.externalstorage.documents"

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class DirectAccessTest {
  private val context: Context = ApplicationProvider.getApplicationContext()
  private lateinit var vault: File
  private val defaultDirectAccess = hasDirectAccess

  @After
  fun tearDown() {
    hasDirectAccess = defaultDirectAccess
  }

  @Before
  fun setUp() {
    allowAllFiles(true)
    shadowOf(context.packageManager).addResolveInfoForIntent(
      Intent(DocumentsContract.PROVIDER_INTERFACE),
      ResolveInfo().apply { providerInfo = ProviderInfo().apply { authority = EXTERNAL_AUTHORITY } }
    )
    vault = File(Environment.getExternalStorageDirectory(), VAULT_NAME).also { it.deleteRecursively(); it.mkdirs() }
  }

  private fun allowAllFiles(allowed: Boolean) {
    hasDirectAccess = { allowed }
  }

  private fun uriOf(relative: String): String =
    DocumentsContract.buildDocumentUriUsingTree(
      DocumentsContract.buildTreeDocumentUri(EXTERNAL_AUTHORITY, "primary:$VAULT_NAME"),
      "primary:$VAULT_NAME" + if (relative.isEmpty()) "" else "/$relative"
    ).toString()

  private fun rootUri(): Uri = DocumentsContract.buildTreeDocumentUri(EXTERNAL_AUTHORITY, "primary:$VAULT_NAME")

  @Test
  fun `a storage uri resolves to its file when all files access is granted`() {
    assertEquals(vault, directFile(context, rootUri()))
  }

  @Test
  fun `a storage uri has no direct file without all files access`() {
    allowAllFiles(false)

    assertNull(directFile(context, rootUri()))
  }

  @Test
  fun `a vault directory becomes a direct notes target`() {
    val target = directNotesTarget(context, rootUri())

    assertEquals(vault.path, target?.path)
  }

  @Test
  fun `renaming a directory moves it on disk and returns the new uri`() {
    File(vault, "old").mkdirs()
    File(vault, "old/note.md").writeText("text")

    val renamed = renameDirectory(context, uriOf("old") + "/", uriOf(""), "fresh")

    assertTrue(renamed.endsWith("/"))
    assertEquals("text", File(vault, "fresh/note.md").readText())
    assertFalse(File(vault, "old").exists())
  }

  @Test(expected = IOException::class)
  fun `renaming onto an existing directory fails and keeps both`() {
    File(vault, "old").mkdirs()
    File(vault, "taken").mkdirs()

    renameDirectory(context, uriOf("old"), uriOf(""), "taken")
  }

  @Test
  fun `moving a file renames it into the destination keeping its modified time`() {
    File(vault, "source").mkdirs()
    File(vault, "destination").mkdirs()
    val note = File(vault, "source/note.md").apply { writeText("text") }
    note.setLastModified(1_700_000_000_000L)

    val moved = moveFile(context, uriOf("source"), "note.md", uriOf("destination"))
    val target = File(vault, "destination/note.md")

    assertTrue(moved)
    assertFalse(note.exists())
    assertEquals("text", target.readText())
    assertEquals(1_700_000_000_000L, target.lastModified())
  }

  @Test
  fun `moving does not overwrite and reports failure for a missing file`() {
    File(vault, "source").mkdirs()
    File(vault, "destination").mkdirs()
    File(vault, "source/note.md").writeText("mine")
    File(vault, "destination/note.md").writeText("theirs")

    assertFalse(moveFile(context, uriOf("source"), "note.md", uriOf("destination")))
    assertFalse(moveFile(context, uriOf("source"), "gone.md", uriOf("destination")))
    assertEquals("mine", File(vault, "source/note.md").readText())
    assertEquals("theirs", File(vault, "destination/note.md").readText())
  }
}
