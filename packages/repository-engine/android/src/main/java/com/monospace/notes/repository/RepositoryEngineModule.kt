package com.monospace.notes.repository

import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RepositoryEngineModule : Module() {
    private val repositoryRuntime = RepositoryRuntime(
        contextProvider = { appContext.reactContext ?: throw Exceptions.ReactContextLost() },
        sendEvent = { name, body -> sendEvent(name, body) }
    )

    override fun definition() = ModuleDefinition {
        Name("RepositoryEngine")

        defineStorage(repositoryRuntime)
        defineIndex(repositoryRuntime)
        defineNotes(repositoryRuntime)
        defineLinks(repositoryRuntime)
        defineVersions(repositoryRuntime)
        defineNames(repositoryRuntime)
        defineSearch(repositoryRuntime)
    }
}
