package com.monospace.notes.repository

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import java.io.File
import java.io.IOException

internal fun renameDirectory(context: Context, directoryUri: String, parentUri: String, newName: String): String {
  val directory = Uri.parse(directoryUri.trimEnd('/'))
  val parent = Uri.parse(parentUri.trimEnd('/'))

  if (findChild(context, parent, newName) != null) throw IOException("$newName already exists")

  val direct = directFile(context, directory)

  if (direct != null) {
    val target = File(direct.parentFile, newName)

    if (!direct.renameTo(target)) throw IOException("cannot rename ${direct.name}")

    return child(context, parent, newName)
  }

  val renamed = DocumentsContract.renameDocument(context.contentResolver, directory, newName)
    ?: throw IOException("cannot rename $directoryUri")

  return renamed.toString().let { if (it.endsWith("/")) it else "$it/" }
}

internal fun moveFile(context: Context, sourceDirectoryUri: String, filename: String, destinationDirectoryUri: String): Boolean {
  val sourceDirectory = Uri.parse(sourceDirectoryUri.trimEnd('/'))
  val destinationDirectory = Uri.parse(destinationDirectoryUri.trimEnd('/'))
  val entry = findChild(context, sourceDirectory, filename) ?: return false

  if (findChild(context, destinationDirectory, filename) != null) return false

  val file = Uri.parse(entry[EntryKeys.URI] as String)
  val direct = directFile(context, file)

  if (direct != null) {
    val target = directFile(context, destinationDirectory)?.let { File(it, filename) } ?: return false

    return direct.renameTo(target)
  }

  val sourceParent = DocumentsContract.buildDocumentUriUsingTree(sourceDirectory, documentIdOf(context, sourceDirectory))
  val destinationParent = DocumentsContract.buildDocumentUriUsingTree(destinationDirectory, documentIdOf(context, destinationDirectory))

  return runCatching {
    DocumentsContract.moveDocument(context.contentResolver, file, sourceParent, destinationParent) != null
  }.getOrDefault(false)
}

private fun child(context: Context, parent: Uri, name: String): String {
  val id = documentIdOf(context, parent) + PATH_SEPARATOR + name

  return DocumentsContract.buildDocumentUriUsingTree(parent, id).toString() + PATH_SEPARATOR
}
