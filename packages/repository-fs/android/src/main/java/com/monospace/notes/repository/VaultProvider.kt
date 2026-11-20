package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import android.provider.DocumentsContract.Document
import java.io.IOException
import uniffi.engine.FsVaultHandle
import uniffi.engine.VaultFs

internal class ProviderVault(private val context: Context, private val root: Uri) : VaultFs {
  override fun readText(path: String): String? {
    val file = resolve(path) ?: return null

    return context.contentResolver.openInputStream(Uri.parse(file[EntryKeys.URI] as String))?.use {
      it.readBytes().toString(Charsets.UTF_8)
    }
  }

  override fun writeText(path: String, text: String) {
    val segments = segmentsOf(path)
    val name = segments.last()
    val parent = ensureDirectory(segments.dropLast(1))
    val bytes = text.toByteArray(Charsets.UTF_8)

    repeat(WRITE_ATTEMPTS) {
      val target = child(parent, name)?.let { Uri.parse(it[EntryKeys.URI] as String) } ?: create(parent, name, VAULT_JSON_MIME)

      context.contentResolver.openOutputStream(target, WRITE_TRUNCATE_MODE)?.use { it.write(bytes) }

      val size = child(parent, name)?.get(EntryKeys.SIZE) as Double?

      if (size == null || size.toLong() == bytes.size.toLong()) return
    }

    throw IOException("write verification failed for $path")
  }

  override fun deleteFile(path: String) {
    val file = resolve(path) ?: return

    runCatching { DocumentsContract.deleteDocument(context.contentResolver, Uri.parse(file[EntryKeys.URI] as String)) }
  }

  override fun listFiles(directory: String): List<String> {
    val uri = directoryUri(segmentsOf(directory)) ?: return emptyList()

    return listDirectory(context, uri)
      .filter { it[EntryKeys.IS_DIRECTORY] != true }
      .map { it[EntryKeys.NAME] as String }
  }

  private fun segmentsOf(path: String) = path.split(PATH_SEPARATOR).filter { it.isNotEmpty() }

  private fun child(directory: Uri, name: String) = findChild(context, directory, name)

  private fun directoryUri(segments: List<String>): Uri? =
    segments.fold(root as Uri?) { current, name ->
      current?.let { child(it, name) }?.takeIf { it[EntryKeys.IS_DIRECTORY] == true }
        ?.let { Uri.parse((it[EntryKeys.URI] as String).trimEnd('/')) }
    }

  private fun ensureDirectory(segments: List<String>): Uri =
    segments.fold(root) { current, name ->
      val existing = child(current, name)

      if (existing != null) Uri.parse((existing[EntryKeys.URI] as String).trimEnd('/')) else create(current, name, Document.MIME_TYPE_DIR)
    }

  private fun resolve(path: String): Map<String, Any?>? {
    val segments = segmentsOf(path)
    val parent = directoryUri(segments.dropLast(1)) ?: return null

    return child(parent, segments.last())?.takeIf { it[EntryKeys.IS_DIRECTORY] != true }
  }

  private fun create(parent: Uri, name: String, mime: String): Uri {
    val parentDocument = DocumentsContract.buildDocumentUriUsingTree(parent, documentIdOf(context, parent))

    return DocumentsContract.createDocument(context.contentResolver, parentDocument, mime, name)
      ?: throw IOException("cannot create $name")
  }
}

internal fun vaultFor(context: Context, rootUri: String): VaultFs {
  val uri = Uri.parse(rootUri)

  return directNotesTarget(context, uri)?.let { FsVaultHandle(it.path) } ?: ProviderVault(context, uri)
}
