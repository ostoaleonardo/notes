package com.monospace.notes.repository

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

internal fun ModuleDefinitionBuilder.defineStorage(runtime: RepositoryRuntime) = with(runtime) {
  Function("hasDirectAccess") { hasDirectAccess() }

  Function("requestDirectAccess") {
    val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, Uri.parse("package:${context.packageName}"))
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    context.startActivity(intent)
  }

  Function("revokePermissions") {
    revokePermissions(context)
  }

  AsyncFunction("listAttachments") Coroutine { uri: String ->
    withContext(Dispatchers.IO) {
      val found = mutableListOf<Triple<String, String, String>>()
      walkAttachments(context, Uri.parse(uri), "", found)

      mapOf(
        ColumnKeys.URIS to found.map { it.first },
        ColumnKeys.NAMES to found.map { it.second },
        ColumnKeys.FOLDERS to found.map { it.third }
      )
    }
  }

  Function("findChild") { uri: String, name: String ->
    findChild(context, Uri.parse(uri), name)
  }

  Function("listDirectorySync") { uri: String ->
    listDirectory(context, Uri.parse(uri))
  }

  AsyncFunction("listDirectory") Coroutine { uri: String ->
    withContext(Dispatchers.IO) { toColumns(listDirectory(context, Uri.parse(uri))) }
  }

  AsyncFunction("readTextFiles") Coroutine { uris: List<String> ->
    readAll(context, uris, readDispatcher) { it }
  }
}
