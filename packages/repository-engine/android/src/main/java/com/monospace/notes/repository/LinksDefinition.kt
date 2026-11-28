package com.monospace.notes.repository

import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import uniffi.engine.LinkNoteRecord
import uniffi.engine.findBacklinkPaths
import uniffi.engine.renameLinksInBodies

internal fun ModuleDefinitionBuilder.defineLinks(runtime: RepositoryRuntime) = with(runtime) {
    AsyncFunction("findBacklinkPaths") Coroutine { titles: List<String>, aliases: List<List<String>>, paths: List<String>, folders: Map<String, String>, targetPath: String, candidatePaths: List<String>, candidateBodies: List<String> ->
        withContext(Dispatchers.Default) {
            val notes = paths.indices.map { LinkNoteRecord(paths[it], titles[it], aliases[it]) }

            findBacklinkPaths(notes, folders, targetPath, candidatePaths, candidateBodies)
        }
    }

    AsyncFunction("renameLinksInBodies") Coroutine { titles: List<String>, aliases: List<List<String>>, paths: List<String>, folders: Map<String, String>, resolveFolders: Map<String, String>?, targetPath: String, newTitle: String, bodies: List<String> ->
        withContext(Dispatchers.Default) {
            val notes = paths.indices.map { LinkNoteRecord(paths[it], titles[it], aliases[it]) }

            renameLinksInBodies(notes, folders, resolveFolders, targetPath, newTitle, bodies)
        }
    }
}
