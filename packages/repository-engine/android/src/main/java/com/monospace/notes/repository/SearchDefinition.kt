package com.monospace.notes.repository

import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

internal fun ModuleDefinitionBuilder.defineSearch(runtime: RepositoryRuntime) = with(runtime) {
    AsyncFunction("searchOpen") Coroutine { requestJson: String ->
        withContext(Dispatchers.IO) {
            searches.open(context, engine(), readDispatcher, requestJson)
        }
    }

    AsyncFunction("searchStep") Coroutine { id: Int, size: Int ->
        withContext(Dispatchers.IO) { searches.step(id, size) }
    }

    AsyncFunction("searchWarm") Coroutine { folderIds: List<String> ->
        withContext(Dispatchers.IO) { searches.warm(context, engine(), readDispatcher, folderIds) }
    }

    Function("searchClose") { id: Int -> searches.close(id) }
}
