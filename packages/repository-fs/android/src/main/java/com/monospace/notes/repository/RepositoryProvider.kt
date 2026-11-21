package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import android.provider.DocumentsContract.Document
import java.io.IOException
import uniffi.engine.DirEntry
import uniffi.engine.EngineException
import uniffi.engine.FsRepositoryHandle
import uniffi.engine.MoveResult
import uniffi.engine.RepositoryFiles

internal class ProviderRepository(private val context: Context, private val root: Uri) : RepositoryFiles {
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
      val target = child(parent, name)?.let { Uri.parse(it[EntryKeys.URI] as String) } ?: create(parent, name, REPOSITORY_JSON_MIME)

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

  override fun listDir(path: String): List<DirEntry> {
    val directory = directoryUri(segmentsOf(path)) ?: return emptyList()

    return listDirectory(context, directory)
      .map { DirEntry(it[EntryKeys.NAME] as String, it[EntryKeys.IS_DIRECTORY] == true) }
      .sortedBy { it.name }
  }

  override fun exists(path: String): Boolean {
    val segments = segmentsOf(path)
    if (segments.isEmpty()) return true

    val parent = directoryUri(segments.dropLast(1)) ?: return false

    return child(parent, segments.last()) != null
  }

  override fun createDir(path: String) {
    ensureDirectory(segmentsOf(path))
  }

  override fun renameDir(path: String, newName: String) {
    val segments = segmentsOf(path)
    val directory = directoryUri(segments) ?: throw IOException("missing $path")
    val parent = directoryUri(segments.dropLast(1)) ?: throw IOException("missing parent of $path")

    if (child(parent, newName) != null) throw EngineException.AlreadyExists(newName)

    renameDirectory(context, directory.toString(), parent.toString(), newName)
  }

  override fun moveFile(from: String, to: String): MoveResult {
    val source = segmentsOf(from)
    val target = segmentsOf(to)
    val sourceDirectory = directoryUri(source.dropLast(1)) ?: return MoveResult.SOURCE_MISSING
    val entry = child(sourceDirectory, source.last())?.takeIf { it[EntryKeys.IS_DIRECTORY] != true }
      ?: return MoveResult.SOURCE_MISSING
    val targetDirectory = directoryUri(target.dropLast(1)) ?: throw IOException("missing ${to}")

    if (child(targetDirectory, target.last()) != null) return MoveResult.TARGET_EXISTS

    val moved = source.last() == target.last() &&
      moveFile(context, sourceDirectory.toString(), source.last(), targetDirectory.toString())

    if (!moved) copyAndDelete(Uri.parse(entry[EntryKeys.URI] as String), targetDirectory, target.last())

    return MoveResult.MOVED
  }

  override fun removeDir(path: String) {
    val directory = directoryUri(segmentsOf(path)) ?: return

    runCatching { DocumentsContract.deleteDocument(context.contentResolver, directory) }
  }

  private fun copyAndDelete(source: Uri, targetDirectory: Uri, name: String) {
    val bytes = context.contentResolver.openInputStream(source)?.use { it.readBytes() }
      ?: throw IOException("cannot read $source")
    val target = create(targetDirectory, name, MARKDOWN_MIME_TYPE)

    context.contentResolver.openOutputStream(target, WRITE_TRUNCATE_MODE)?.use { it.write(bytes) }
    DocumentsContract.deleteDocument(context.contentResolver, source)
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

internal fun repositoryFor(context: Context, rootUri: String): RepositoryFiles {
  val uri = Uri.parse(rootUri)

  return directNotesTarget(context, uri)?.let { FsRepositoryHandle(it.path) } ?: ProviderRepository(context, uri)
}
