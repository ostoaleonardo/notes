package com.monospace.notes.repository

import android.content.Context
import android.content.pm.ProviderInfo
import android.database.Cursor
import android.database.MatrixCursor
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.provider.DocumentsContract.Document
import android.provider.DocumentsContract.Root
import android.provider.DocumentsProvider
import java.io.File
import java.io.FileNotFoundException
import org.robolectric.Robolectric
import org.robolectric.Shadows.shadowOf

const val FAKE_AUTHORITY = "fake.documents"
const val FAKE_ROOT_ID = "root"

private val DOCUMENT_COLUMNS = arrayOf(
    Document.COLUMN_DOCUMENT_ID,
    Document.COLUMN_DISPLAY_NAME,
    Document.COLUMN_MIME_TYPE,
    Document.COLUMN_LAST_MODIFIED,
    Document.COLUMN_SIZE,
    Document.COLUMN_FLAGS
)

private val ROOT_COLUMNS = arrayOf(
    Root.COLUMN_ROOT_ID,
    Root.COLUMN_DOCUMENT_ID,
    Root.COLUMN_TITLE,
    Root.COLUMN_FLAGS
)

private const val ALL_FLAGS = Document.FLAG_SUPPORTS_WRITE or
    Document.FLAG_SUPPORTS_DELETE or
    Document.FLAG_SUPPORTS_RENAME or
    Document.FLAG_SUPPORTS_MOVE or
    Document.FLAG_DIR_SUPPORTS_CREATE

class FakeDocumentsProvider : DocumentsProvider() {
    private class Node(var name: String, val directory: Boolean, var parent: String?) {
        var file: File? = null
        var modified = 0L
    }

    private val nodes = linkedMapOf<String, Node>()
    private var counter = 0
    private lateinit var storage: File

    override fun onCreate(): Boolean {
        storage = File.createTempFile("fake-documents", "").also {
            it.delete()
            it.mkdirs()
            it.deleteOnExit()
        }
        nodes[FAKE_ROOT_ID] = Node(FAKE_ROOT_ID, true, null)

        return true
    }

    override fun queryRoots(projection: Array<String>?): Cursor =
        MatrixCursor(projection ?: ROOT_COLUMNS).apply {
            newRow()
                .add(Root.COLUMN_ROOT_ID, FAKE_ROOT_ID)
                .add(Root.COLUMN_DOCUMENT_ID, FAKE_ROOT_ID)
                .add(Root.COLUMN_TITLE, "fake")
                .add(Root.COLUMN_FLAGS, Root.FLAG_SUPPORTS_CREATE)
        }

    override fun queryDocument(documentId: String, projection: Array<String>?): Cursor =
        MatrixCursor(projection ?: DOCUMENT_COLUMNS).also { addRow(it, documentId) }

    override fun queryChildDocuments(parentDocumentId: String, projection: Array<String>?, sortOrder: String?): Cursor =
        MatrixCursor(projection ?: DOCUMENT_COLUMNS).also { cursor ->
            nodes.filterValues { it.parent == parentDocumentId }.keys.forEach { addRow(cursor, it) }
        }

    override fun openDocument(documentId: String, mode: String, signal: CancellationSignal?): ParcelFileDescriptor {
        val file = node(documentId).file ?: throw FileNotFoundException(documentId)

        return ParcelFileDescriptor.open(file, ParcelFileDescriptor.parseMode(mode))
    }

    override fun createDocument(parentDocumentId: String, mimeType: String, displayName: String): String {
        val directory = mimeType == Document.MIME_TYPE_DIR
        val id = "$parentDocumentId/$displayName"

        if (nodes.containsKey(id)) throw IllegalStateException("$displayName already exists")

        nodes[id] = Node(displayName, directory, parentDocumentId).also {
            if (!directory) it.file = File(storage, "doc-${counter++}").apply { createNewFile() }
        }

        return id
    }

    override fun deleteDocument(documentId: String) {
        nodes.keys.filter { it == documentId || it.startsWith("$documentId/") }.forEach { nodes.remove(it) }
    }

    override fun renameDocument(documentId: String, displayName: String): String? {
        val target = "${node(documentId).parent}/$displayName"

        return relocate(documentId, target, displayName)
    }

    override fun moveDocument(sourceDocumentId: String, sourceParentDocumentId: String, targetParentDocumentId: String): String {
        val name = node(sourceDocumentId).name

        return relocate(sourceDocumentId, "$targetParentDocumentId/$name", name, targetParentDocumentId)
    }

    override fun isChildDocument(parentDocumentId: String, documentId: String): Boolean =
        documentId == parentDocumentId || documentId.startsWith("$parentDocumentId/")

    private fun relocate(documentId: String, targetId: String, name: String, newParent: String? = null): String {
        if (nodes.containsKey(targetId)) throw IllegalStateException("$targetId already exists")

        val moved = nodes.filterKeys { it == documentId || it.startsWith("$documentId/") }

        moved.forEach { (id, entry) ->
            nodes.remove(id)
            nodes[targetId + id.removePrefix(documentId)] = entry
            if (id.startsWith("$documentId/")) entry.parent = targetId + entry.parent!!.removePrefix(documentId)
        }

        nodes.getValue(targetId).apply {
            this.name = name
            if (newParent != null) parent = newParent
        }

        return targetId
    }

    private fun node(documentId: String) = nodes[documentId] ?: throw FileNotFoundException(documentId)

    private fun addRow(cursor: MatrixCursor, documentId: String) {
        val entry = node(documentId)

        cursor.newRow()
            .add(Document.COLUMN_DOCUMENT_ID, documentId)
            .add(Document.COLUMN_DISPLAY_NAME, entry.name)
            .add(Document.COLUMN_MIME_TYPE, if (entry.directory) Document.MIME_TYPE_DIR else "text/plain")
            .add(Document.COLUMN_LAST_MODIFIED, entry.file?.lastModified() ?: entry.modified)
            .add(Document.COLUMN_SIZE, entry.file?.length())
            .add(Document.COLUMN_FLAGS, ALL_FLAGS)
    }

    companion object {
        fun register(context: Context): FakeDocumentsProvider {
            val info = ProviderInfo().apply {
                authority = FAKE_AUTHORITY
                exported = true
                grantUriPermissions = true
                readPermission = android.Manifest.permission.MANAGE_DOCUMENTS
                writePermission = android.Manifest.permission.MANAGE_DOCUMENTS
            }
            val backend = FakeDocumentsProvider().also { it.attachInfo(context, info) }

            shadowOf(context.packageManager).addResolveInfoForIntent(
                android.content.Intent(android.provider.DocumentsContract.PROVIDER_INTERFACE),
                android.content.pm.ResolveInfo().apply { providerInfo = info }
            )

            Robolectric.buildContentProvider(ProxyProvider::class.java)
                .create(info.also { ProxyProvider.target = backend })

            return backend
        }
    }
}

class ProxyProvider : android.content.ContentProvider() {
    override fun onCreate() = true

    override fun query(uri: android.net.Uri, projection: Array<String>?, selection: String?, selectionArgs: Array<String>?, sortOrder: String?): Cursor? =
        target.query(uri, projection, android.os.Bundle.EMPTY, null)

    override fun call(method: String, arg: String?, extras: android.os.Bundle?): android.os.Bundle? = target.call(method, arg, extras)

    override fun openFile(uri: android.net.Uri, mode: String): ParcelFileDescriptor? = target.openFile(uri, mode)

    override fun getType(uri: android.net.Uri): String? = target.getType(uri)

    override fun insert(uri: android.net.Uri, values: android.content.ContentValues?): android.net.Uri? = null

    override fun delete(uri: android.net.Uri, selection: String?, selectionArgs: Array<String>?) = 0

    override fun update(uri: android.net.Uri, values: android.content.ContentValues?, selection: String?, selectionArgs: Array<String>?) = 0

    companion object {
        lateinit var target: FakeDocumentsProvider
    }
}
