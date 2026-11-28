package com.monospace.notes.repository

import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import uniffi.engine.VersionRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

internal fun ModuleDefinitionBuilder.defineVersions(runtime: RepositoryRuntime) = with(runtime) {
    AsyncFunction("versionsRead") Coroutine { rootUri: String, key: String ->
        withContext(Dispatchers.IO) { versionsFor(rootUri).read(key) }
    }

    AsyncFunction("versionsWrite") Coroutine { rootUri: String, key: String, json: String ->
        withContext(Dispatchers.IO) { versionsFor(rootUri).write(key, json) }
    }

    AsyncFunction("versionsDelete") Coroutine { rootUri: String, key: String ->
        withContext(Dispatchers.IO) { versionsFor(rootUri).delete(key) }
    }

    AsyncFunction("versionsCommit") Coroutine { rootUri: String, key: String, title: String, content: String, id: String, createdAt: Double, maxVersions: Int, maxAgeMs: Double ->
        withContext(Dispatchers.IO) { versionsFor(rootUri).commit(key, VersionRequest(id, title, content, createdAt.toLong(), maxVersions.toUInt(), maxAgeMs.toLong())) }
    }

    AsyncFunction("versionsMigrateLegacy") Coroutine { rootUri: String, folderPath: String ->
        withContext(Dispatchers.IO) { versionsFor(rootUri).migrateLegacy(folderPath, folderPath) }
    }
}
