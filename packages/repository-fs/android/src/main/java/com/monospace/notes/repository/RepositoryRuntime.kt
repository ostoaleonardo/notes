package com.monospace.notes.repository

import android.content.Context
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import uniffi.engine.Engine
import uniffi.engine.VersionsHandle

internal class RepositoryRuntime(
  private val contextProvider: () -> Context,
  val sendEvent: (String, Map<String, Any?>) -> Unit
) {
  val context: Context
    get() = contextProvider()

  val readDispatcher = Dispatchers.IO.limitedParallelism(READ_PARALLELISM)
  val indexLock = Mutex()
  val searches = SearchRegistry()

  private val engineLock = Any()
  private var sharedEngine: Engine? = null
  private val versionStores = ConcurrentHashMap<String, VersionsHandle>()

  fun engine(): Engine = synchronized(engineLock) {
    sharedEngine ?: openEngine(context).also { sharedEngine = it }
  }

  fun versionsFor(rootUri: String): VersionsHandle =
    versionStores.getOrPut("$rootUri#${hasDirectAccess()}") { VersionsHandle(repositoryFor(context, rootUri)) }
}
