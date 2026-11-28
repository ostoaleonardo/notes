package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import android.provider.DocumentsContract.Document
import androidx.test.core.app.ApplicationProvider

class SafFixture {
    val context: Context = ApplicationProvider.getApplicationContext()
    val provider = FakeDocumentsProvider.register(context)
    val root: Uri = DocumentsContract.buildTreeDocumentUri(FAKE_AUTHORITY, FAKE_ROOT_ID)

    fun directory(parent: Uri, name: String): Uri = create(parent, name, Document.MIME_TYPE_DIR)

    fun file(parent: Uri, name: String, text: String = ""): Uri =
        create(parent, name, MARKDOWN_MIME_TYPE).also { uri ->
            if (text.isNotEmpty()) context.contentResolver.openOutputStream(uri, WRITE_TRUNCATE_MODE)?.use { it.write(text.toByteArray()) }
        }

    fun read(parent: Uri, name: String): String? =
        findChild(context, parent, name)?.let {
            context.contentResolver.openInputStream(Uri.parse(it[EntryKeys.URI] as String))?.use { stream -> stream.readBytes().decodeToString() }
        }

    fun names(parent: Uri): List<String> = listDirectory(context, parent).map { it[EntryKeys.NAME] as String }.sorted()

    private fun create(parent: Uri, name: String, mime: String): Uri {
        val parentDocument = DocumentsContract.buildDocumentUriUsingTree(parent, documentIdOf(context, parent))
        val created = DocumentsContract.createDocument(context.contentResolver, parentDocument, mime, name)!!

        return DocumentsContract.buildDocumentUriUsingTree(parent, DocumentsContract.getDocumentId(created))
    }
}
