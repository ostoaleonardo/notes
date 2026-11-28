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

private const val REPOSITORY_NAME = "repository"
private const val EXTERNAL_AUTHORITY = "com.android.externalstorage.documents"

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class DirectAccessTest {
    private val context: Context = ApplicationProvider.getApplicationContext()
    private lateinit var repository: File
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
        repository = File(Environment.getExternalStorageDirectory(), REPOSITORY_NAME).also { it.deleteRecursively(); it.mkdirs() }
    }

    private fun allowAllFiles(allowed: Boolean) {
        hasDirectAccess = { allowed }
    }

    private fun uriOf(relative: String): String =
        DocumentsContract.buildDocumentUriUsingTree(
            DocumentsContract.buildTreeDocumentUri(EXTERNAL_AUTHORITY, "primary:$REPOSITORY_NAME"),
            "primary:$REPOSITORY_NAME" + if (relative.isEmpty()) "" else "/$relative"
        ).toString()

    private fun rootUri(): Uri = DocumentsContract.buildTreeDocumentUri(EXTERNAL_AUTHORITY, "primary:$REPOSITORY_NAME")

    @Test
    fun `a storage uri resolves to its file when all files access is granted`() {
        assertEquals(repository, directFile(context, rootUri()))
    }

    @Test
    fun `a storage uri has no direct file without all files access`() {
        allowAllFiles(false)

        assertNull(directFile(context, rootUri()))
    }

    @Test
    fun `a repository directory becomes a direct notes target`() {
        val target = directNotesTarget(context, rootUri())

        assertEquals(repository.path, target?.path)
    }

    @Test
    fun `renaming a directory moves it on disk and returns the new uri`() {
        File(repository, "old").mkdirs()
        File(repository, "old/note.md").writeText("text")

        val renamed = renameDirectory(context, uriOf("old") + "/", uriOf(""), "fresh")

        assertTrue(renamed.endsWith("/"))
        assertEquals("text", File(repository, "fresh/note.md").readText())
        assertFalse(File(repository, "old").exists())
    }

    @Test(expected = IOException::class)
    fun `renaming onto an existing directory fails and keeps both`() {
        File(repository, "old").mkdirs()
        File(repository, "taken").mkdirs()

        renameDirectory(context, uriOf("old"), uriOf(""), "taken")
    }

    @Test
    fun `moving a file renames it into the destination keeping its modified time`() {
        File(repository, "source").mkdirs()
        File(repository, "destination").mkdirs()
        val note = File(repository, "source/note.md").apply { writeText("text") }
        note.setLastModified(1_700_000_000_000L)

        val moved = moveFile(context, uriOf("source"), "note.md", uriOf("destination"))
        val target = File(repository, "destination/note.md")

        assertTrue(moved)
        assertFalse(note.exists())
        assertEquals("text", target.readText())
        assertEquals(1_700_000_000_000L, target.lastModified())
    }

    @Test
    fun `moving does not overwrite and reports failure for a missing file`() {
        File(repository, "source").mkdirs()
        File(repository, "destination").mkdirs()
        File(repository, "source/note.md").writeText("mine")
        File(repository, "destination/note.md").writeText("theirs")

        assertFalse(moveFile(context, uriOf("source"), "note.md", uriOf("destination")))
        assertFalse(moveFile(context, uriOf("source"), "gone.md", uriOf("destination")))
        assertEquals("mine", File(repository, "source/note.md").readText())
        assertEquals("theirs", File(repository, "destination/note.md").readText())
    }
}
